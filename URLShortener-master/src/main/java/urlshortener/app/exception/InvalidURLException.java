package urlshortener.app.exception;

public class InvalidURLException extends RuntimeException {
    public InvalidURLException(String message) {
        super(message);
    }
}
