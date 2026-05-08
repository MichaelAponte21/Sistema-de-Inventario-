package EntornosProgramacion.SistemaInventario.dto.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record ArqueoCajaResponse(
    Long id,
    OffsetDateTime fechaApertura,
    OffsetDateTime fechaCierre,
    BigDecimal montoInicial,
    BigDecimal montoVentasEfectivo,
    BigDecimal montoFinalEsperado,
    BigDecimal montoFinalReal,
    BigDecimal diferencia,
    String observaciones,
    Boolean abierto,
    Long usuarioId,
    String usuarioEmail
) {}
