package urlshortener.app.repository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;
import redis.clients.jedis.Jedis;

import java.util.Optional;

@Repository
public class URLRepository {

    private static final Logger LOGGER = LoggerFactory.getLogger(URLRepository.class);
    private static final String ID_KEY = "id";
    private static final String URL_HASH_KEY = "url:";

    private final Jedis jedis;

    public URLRepository() {
        this.jedis = new Jedis();
    }

    public URLRepository(Jedis jedis) {
        this.jedis = jedis;
    }

    public Long getNextId() {
        Long id = jedis.incr(ID_KEY);
        LOGGER.debug("Generated next id: {}", id);
        return id;
    }

    public void save(String shortId, String longUrl) {
        LOGGER.debug("Saving shortId={} -> longUrl={}", shortId, longUrl);
        jedis.hset(URL_HASH_KEY, shortId, longUrl);
    }

    public Optional<String> findByShortId(String shortId) {
        String longUrl = jedis.hget(URL_HASH_KEY, shortId);
        LOGGER.debug("Lookup shortId={} -> {}", shortId, longUrl);
        return Optional.ofNullable(longUrl);
    }
}
