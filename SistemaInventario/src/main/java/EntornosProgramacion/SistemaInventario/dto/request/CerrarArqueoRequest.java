package EntornosProgramacion.SistemaInventario.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record CerrarArqueoRequest(
    @NotNull @DecimalMin("0.00")
    BigDecimal montoFinalReal,
    String observaciones
) {}
