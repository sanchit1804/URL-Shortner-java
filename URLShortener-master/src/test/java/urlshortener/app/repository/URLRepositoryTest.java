package urlshortener.app.repository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import redis.clients.jedis.JedisPool;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class URLRepositoryTest {

    private URLRepository urlRepository;

    @BeforeEach
    void setUp() {
        JedisPool pool = new JedisPool("localhost", 6379);
        urlRepository = new URLRepository(pool);
    }

    @Test
    void getNextId_incrementsAndReturnsValue() {
        Long first = urlRepository.getNextId();
        Long second = urlRepository.getNextId();
        assertEquals(first + 1, second);
    }

    @Test
    void save_and_findByShortId_roundTrip() {
        urlRepository.save("testKey123", "https://example.com");
        Optional<String> result = urlRepository.findByShortId("testKey123");
        assertTrue(result.isPresent());
        assertEquals("https://example.com", result.get());
    }

    @Test
    void findByShortId_returnsEmptyWhenNotFound() {
        Optional<String> result = urlRepository.findByShortId("doesNotExist999");
        assertTrue(result.isEmpty());
    }

    @Test
    void findShortIdByLongUrl_returnsExistingShortId() {
        urlRepository.save("testKey456", "https://example.org");
        Optional<String> result = urlRepository.findShortIdByLongUrl("https://example.org");
        assertTrue(result.isPresent());
        assertEquals("testKey456", result.get());
    }
}
