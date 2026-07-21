package com.zyntra.backend.email;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final String fromAddress;

    public EmailService(JavaMailSender mailSender, @Value("${spring.mail.username}") String fromAddress) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
    }

    // Async so the request thread (the "forgot password" endpoint) doesn't
    // block on the SMTP round-trip — Gmail's connect + STARTTLS + auth +
    // send often takes a second or more, and there's no reason the caller
    // should wait on it since the response is identical either way.
    @Async
    public void sendPasswordResetCode(String toEmail, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject("Your Zyntra password reset code");
        message.setText(
            "Your password reset code is: " + code + "\n\n"
                + "This code expires in 15 minutes. If you didn't request a password reset, you can ignore this email."
        );
        try {
            mailSender.send(message);
        } catch (MailException ex) {
            // Swallowed rather than propagated: a transient SMTP failure here
            // must not turn into a user-facing error that differs from the
            // "no such account" response — either would let an attacker infer
            // whether an email address has an account.
            log.error("Failed to send password reset email to {}", toEmail, ex);
        }
    }
}
