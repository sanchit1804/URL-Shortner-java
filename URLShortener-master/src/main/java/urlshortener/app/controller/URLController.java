package urlshortener.app.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;
import urlshortener.app.dto.ShortenRequest;
import urlshortener.app.dto.ShortenResponse;
import urlshortener.app.service.URLConverterService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
public class URLController {

    private static final Logger LOGGER = LoggerFactory.getLogger(URLController.class);

    private final URLConverterService urlConverterService;

    public URLController(URLConverterService urlConverterService) {
        this.urlConverterService = urlConverterService;
    }

    @PostMapping(value = "/shortener", consumes = "application/json")
    public ResponseEntity<ShortenResponse> shortenUrl(@RequestBody @Valid final ShortenRequest shortenRequest,
                                                        HttpServletRequest request) {
        LOGGER.info("Received url to shorten: {}", shortenRequest.getUrl());

        ShortenResponse shortUrlResponse = urlConverterService.shortenURL(shortenRequest.getUrl());

        LOGGER.info("Shortened url: {}", shortUrlResponse.getShortUrl());
        return ResponseEntity.ok(shortUrlResponse);
    }

    @GetMapping(value = "/{id}")
    public RedirectView redirectUrl(@PathVariable String id) {
        LOGGER.info("Received shortened id to redirect: {}", id);

        String longUrl = urlConverterService.getLongURLFromID(id);
        LOGGER.info("Resolved to original URL: {}", longUrl);

        // longUrl may or may not already include a scheme; normalize it.
        String target = (longUrl.startsWith("http://") || longUrl.startsWith("https://"))
                ? longUrl
                : "http://" + longUrl;

        RedirectView redirectView = new RedirectView();
        redirectView.setUrl(target);
        return redirectView;
    }
}
