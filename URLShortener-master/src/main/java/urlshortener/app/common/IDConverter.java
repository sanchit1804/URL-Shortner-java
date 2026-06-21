package urlshortener.app.common;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

public final class IDConverter {

    public static final IDConverter INSTANCE = new IDConverter();

    private static final Map<Character, Integer> CHAR_TO_INDEX = new HashMap<>();
    private static final List<Character> INDEX_TO_CHAR = new ArrayList<>();

    static {
        for (int i = 0; i < 26; i++) {
            char c = (char) ('a' + i);
            CHAR_TO_INDEX.put(c, i);
            INDEX_TO_CHAR.add(c);
        }
        for (int i = 26; i < 52; i++) {
            char c = (char) ('A' + (i - 26));
            CHAR_TO_INDEX.put(c, i);
            INDEX_TO_CHAR.add(c);
        }
        for (int i = 52; i < 62; i++) {
            char c = (char) ('0' + (i - 52));
            CHAR_TO_INDEX.put(c, i);
            INDEX_TO_CHAR.add(c);
        }
    }

    private IDConverter() {
    }

    public static String createUniqueID(Long id) {
        List<Integer> base62Digits = toBase62Digits(id);
        StringBuilder sb = new StringBuilder();
        for (int digit : base62Digits) {
            sb.append(INDEX_TO_CHAR.get(digit));
        }
        return sb.toString();
    }

    public static Long getDictionaryKeyFromUniqueID(String uniqueID) {
        long id = 0L;
        int exp = uniqueID.length() - 1;
        for (int i = 0; i < uniqueID.length(); i++, exp--) {
            int base10Digit = CHAR_TO_INDEX.get(uniqueID.charAt(i));
            id += (long) (base10Digit * Math.pow(62.0, exp));
        }
        return id;
    }

    private static List<Integer> toBase62Digits(Long id) {
        LinkedList<Integer> digits = new LinkedList<>();
        long remaining = id;
        if (remaining == 0) {
            digits.add(0);
            return digits;
        }
        while (remaining > 0) {
            digits.addFirst((int) (remaining % 62));
            remaining /= 62;
        }
        return digits;
    }
}
