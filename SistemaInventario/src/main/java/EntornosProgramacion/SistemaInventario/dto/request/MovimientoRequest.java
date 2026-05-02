package EntornosProgramacion.SistemaInventario.dto.request;

import EntornosProgramacion.SistemaInventario.model.TipoMovimiento;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record MovimientoRequest(
    @NotNull(message = "El tipo de movimiento es obligatorio")
    TipoMovimiento tipo,

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser mayor que 0")
    Integer cantidad,

    @Size(max = 500, message = "La observacion no puede superar 500 caracteres")
    String observacion,

    @NotNull(message = "El producto es obligatorio")
    String productoId
) {
}
