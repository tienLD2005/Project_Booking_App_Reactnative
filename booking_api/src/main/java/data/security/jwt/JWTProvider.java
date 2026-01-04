package data.security.jwt;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.SignatureException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class JWTProvider {
    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expire}")
    private long jwtExpire;

    @Value("${jwt.refresh}")
    private long jwtRefresh;
    private SecretKey getSecretKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String email, String role){
        Date now = new Date();
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + jwtExpire))
                .signWith(getSecretKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    public String generateRefreshToken(String email, String role){
        Date now = new Date();
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + jwtRefresh))
                .signWith(getSecretKey(), SignatureAlgorithm.HS512)
                .compact();
    }


    public boolean validateToken(String token){
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSecretKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e){
            log.error("JWT token expired!");
        } catch (UnsupportedJwtException e){
            log.error("JWT token unsupported!");
        } catch (MalformedJwtException e){
            log.error("JWT token malformed!");
        } catch (SignatureException e){
            log.error("JWT token signature error!");
        } catch (IllegalArgumentException e){
            log.error("JWT token argument error!");
        }
        return false;
    }


    public String getUsernameFromToken(String token){
        return Jwts.parserBuilder()
                .setSigningKey(getSecretKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }


    public String refreshToken(String token, String email){
        if (validateToken(token) && getUsernameFromToken(token).equals(email)) {
            Date now = new Date();
            return Jwts.builder()
                    .setSubject(email)
                    .setIssuedAt(now)
                    .setExpiration(new Date(now.getTime() + jwtRefresh))
                    .signWith(getSecretKey(), SignatureAlgorithm.HS512)
                    .compact();
        }
        return null;
    }

    public String extractToken(HttpServletRequest request){
        String bearerToken = request.getHeader("Authorization");
        if(bearerToken != null && bearerToken.startsWith("Bearer ")){
            return bearerToken.substring(7);
        }
        return null;
    }
}