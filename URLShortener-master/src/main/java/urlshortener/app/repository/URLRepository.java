package urlshortener.app.repository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

import java.util.Optional;

@Repository
public class URLRepository {

    private static final Logger LOGGER = LoggerFactory.getLogger(URLRepository.class);
    private static final String ID_KEY = "id";
    private static final String URL_HASH_KEY = "url:";
    private static final String REVERSE_HASH_KEY = "reverse:";

    private final JedisPool jedisPool;

    public URLRepository(JedisPool jedisPool) {
        this.jedisPool = jedisPool;
    }

    public Long getNextId() {
        try (Jedis jedis = jedisPool.getResource()) {
            Long id = jedis.incr(ID_KEY);
            LOGGER.debug("Generated next id: {}", id);
            return id;
        }
    }

    public void save(String shortId, String longUrl) {
        try (Jedis jedis = jedisPool.getResource()) {
            LOGGER.debug("Saving shortId={} -> longUrl={}", shortId, longUrl);
            jedis.hset(URL_HASH_KEY, shortId, longUrl);
            jedis.hset(REVERSE_HASH_KEY, longUrl, shortId);
        }
    }

    public Optional<String> findByShortId(String shortId) {
        try (Jedis jedis = jedisPool.getResource()) {
            String longUrl = jedis.hget(URL_HASH_KEY, shortId);
            LOGGER.debug("Lookup shortId={} -> {}", shortId, longUrl);
            return Optional.ofNullable(longUrl);
        }
    }

    public Optional<String> findShortIdByLongUrl(String longUrl) {
        try (Jedis jedis = jedisPool.getResource()) {
            String shortId = jedis.hget(REVERSE_HASH_KEY, longUrl);
            LOGGER.debug("Reverse lookup longUrl={} -> {}", longUrl, shortId);
            return Optional.ofNullable(shortId);
        }
    }
}
