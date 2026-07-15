package urlshortener.app.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import urlshortener.app.common.IDConverter;
import urlshortener.app.common.URLValidator;
import urlshortener.app.dto.ShortenResponse;
import urlshortener.app.exception.InvalidURLException;
import urlshortener.app.exception.URLNotFoundException;
import urlshortener.app.repository.URLRepository;
import java.util.Optional;

@Service
public class URLConverterService {

    private static final Logger LOGGER = LoggerFactory.getLogger(URLConverterService.class);

    private final URLRepository urlRepository;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    public URLConverterService(URLRepository urlRepository) {
        this.urlRepository = urlRepository;
    }

    public ShortenResponse shortenURL(String longUrl) {
        if (!URLValidator.INSTANCE.validateURL(longUrl)) {
            throw new InvalidURLException("Please enter a valid URL: " + longUrl);
        }

        Optional<String> existingShortId = urlRepository.findShortIdByLongUrl(longUrl);
        if (existingShortId.isPresent()) {
            LOGGER.info("URL already shortened, returning existing shortId={}", existingShortId.get());
            return new ShortenResponse(buildShortUrl(existingShortId.get()));
        }

        Long nextId = urlRepository.getNextId();
        String shortId = IDConverter.createUniqueID(nextId);
        urlRepository.save(shortId, longUrl);
        LOGGER.info("Shortened {} -> {}", longUrl, shortId);

        return new ShortenResponse(buildShortUrl(shortId));
    }

    public String getLongURLFromID(String shortId) {
        return urlRepository.findByShortId(shortId)
                .orElseThrow(() -> new URLNotFoundException("No URL found for id: " + shortId));
    }

    private String buildShortUrl(String shortId) {
        String base = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        return base + "/" + shortId;
    }
}
