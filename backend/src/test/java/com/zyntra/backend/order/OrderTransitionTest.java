package com.zyntra.backend.order;

import com.zyntra.backend.common.exception.ConflictException;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class OrderTransitionTest {

    private Order orderWithStatus(OrderStatus status) {
        Order order = new Order();
        order.setStatus(status);
        return order;
    }

    @Test
    void pendingCanTransitionTo_acceptedDeclinedOrCancelled() {
        assertThat(orderWithStatus(OrderStatus.PENDING)).satisfies(o -> o.transitionTo(OrderStatus.ACCEPTED));
        assertThat(orderWithStatus(OrderStatus.PENDING)).satisfies(o -> o.transitionTo(OrderStatus.DECLINED));
        assertThat(orderWithStatus(OrderStatus.PENDING)).satisfies(o -> o.transitionTo(OrderStatus.CANCELLED));
    }

    @Test
    void fullHappyPathTransitionsSucceed() {
        Order order = orderWithStatus(OrderStatus.PENDING);
        order.transitionTo(OrderStatus.ACCEPTED);
        order.transitionTo(OrderStatus.IN_TRANSIT);
        order.transitionTo(OrderStatus.OUT_FOR_DELIVERY);
        order.transitionTo(OrderStatus.DELIVERED);
        assertThat(order.getStatus()).isEqualTo(OrderStatus.DELIVERED);
    }

    @Test
    void illegalJumpFromPendingToDelivered_throwsConflict() {
        Order order = orderWithStatus(OrderStatus.PENDING);
        assertThatThrownBy(() -> order.transitionTo(OrderStatus.DELIVERED))
            .isInstanceOf(ConflictException.class)
            .satisfies(ex -> assertThat(((ConflictException) ex).getCode()).isEqualTo("INVALID_STATUS_TRANSITION"));
    }

    @Test
    void terminalStates_rejectAnyFurtherTransition() {
        for (OrderStatus terminal : new OrderStatus[]{OrderStatus.DELIVERED, OrderStatus.DECLINED, OrderStatus.CANCELLED}) {
            Order order = orderWithStatus(terminal);
            assertThatThrownBy(() -> order.transitionTo(OrderStatus.ACCEPTED))
                .isInstanceOf(ConflictException.class);
        }
    }
}
