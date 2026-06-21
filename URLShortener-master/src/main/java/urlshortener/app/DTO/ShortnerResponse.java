package urlshortener.app.dto;

public class ShortenResponse {

    private final String shortUrl;

    public ShortenResponse(String shortUrl) {
        this.shortUrl = shortUrl;
    }

    public String getShortUrl() {
        return shortUrl;
    }
}