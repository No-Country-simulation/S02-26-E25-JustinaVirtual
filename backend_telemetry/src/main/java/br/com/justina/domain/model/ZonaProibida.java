package br.com.justina.domain.model;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class ZonaProibida {
    private Double minX;
    private Double maxX;
    private Double minY;
    private Double maxY;
    private Double minZ;
    private Double maxZ;

    // A mágica matemática da colisão acontece aqui
    public boolean contem(Double x, Double y, Double z) {
        if (x == null || y == null || z == null)
            return false;
        return x >= minX && x <= maxX &&
                y >= minY && y <= maxY &&
                z >= minZ && z <= maxZ;
    }
}