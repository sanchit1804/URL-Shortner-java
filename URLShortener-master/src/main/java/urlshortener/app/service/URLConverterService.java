package urlshortener.app.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import urlshortener.app.common.IDConverter;
import urlshortener.app.common.URLValidator;
import urlshortener.app.exception.InvalidURLException;
import urlshortener.app.exception.URLNotFoundException;
import urlshortener.app.repository.URLRepository;
import java.util.Optional;

@Service
public class URLConverterService {

    private static final Logger LOGGER = LoggerFactory.getLogger(URLConverterService.class);
    private final URLRepository urlRepository;

    public URLConverterService(URLRepository urlRepository) {
        this.urlRepository = urlRepository;
    }

    public String shortenURL(String baseUrl, String longUrl) {
        if (!URLValidator.INSTANCE.validateURL(longUrl)) {
            throw new InvalidURLException("Please enter a valid URL: " + longUrl);
        }

        Optional<String> existingShortId = urlRepository.findShortIdByLongUrl(longUrl);
        if (existingShortId.isPresent()) {
            LOGGER.info("URL already shortened, returning existing shortId={}", existingShortId.get());
            return buildShortUrl(baseUrl, existingShortId.get());
        }

        Long nextId = urlRepository.getNextId();
        String shortId = IDConverter.createUniqueID(nextId);
        urlRepository.save(shortId, longUrl);
        LOGGER.info("Shortened {} -> {}", longUrl, shortId);

        return buildShortUrl(baseUrl, shortId);
    }

    public String getLongURLFromID(String shortId) {
        return urlRepository.findByShortId(shortId)
                .orElseThrow(() -> new URLNotFoundException("No URL found for id: " + shortId));
    }

    private String buildShortUrl(String baseUrl, String shortId) {
        String root = baseUrl.endsWith("/shortener")
                ? baseUrl.substring(0, baseUrl.length() - "/shortener".length())
                : baseUrl;
        if (!root.endsWith("/")) {
            root += "/";
        }
        return root + shortId;
    }
}
