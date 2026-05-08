package EntornosProgramacion.SistemaInventario.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record AbrirArqueoRequest(
    @NotNull @DecimalMin("0.00")
    BigDecimal montoInicial,
    String observaciones
) {}
