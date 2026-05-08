package EntornosProgramacion.SistemaInventario.service;

import EntornosProgramacion.SistemaInventario.dto.response.ResumenResponse;
import EntornosProgramacion.SistemaInventario.model.ArqueoCaja;
import EntornosProgramacion.SistemaInventario.model.DetalleVenta;
import EntornosProgramacion.SistemaInventario.model.Venta;
import EntornosProgramacion.SistemaInventario.model.VentaEstado;
import EntornosProgramacion.SistemaInventario.repository.ArqueoCajaRepository;
import EntornosProgramacion.SistemaInventario.repository.ProductoRepository;
import EntornosProgramacion.SistemaInventario.repository.VentaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReporteService {

    private final VentaRepository ventaRepository;
    private final ProductoRepository productoRepository;
    private final ArqueoCajaRepository arqueoCajaRepository;

    @Transactional(readOnly = true)
    public ResumenResponse obtenerResumen() {
        OffsetDateTime ahora = OffsetDateTime.now(ZoneOffset.UTC);
        OffsetDateTime inicioDia = ahora.toLocalDate().atStartOfDay().atOffset(ZoneOffset.UTC);
        OffsetDateTime inicioSemana = inicioDia.minusDays(6);
        OffsetDateTime inicioMes = inicioDia.withDayOfMonth(1);
        OffsetDateTime hace7Dias = inicioDia.minusDays(6);

        List<Venta> todasMes = ventaRepository.findEnPeriodo(inicioMes, ahora).stream()
            .filter(v -> VentaEstado.COMPLETADA.equals(v.getEstado()))
            .toList();

        List<Venta> ventasHoy = todasMes.stream()
            .filter(v -> !v.getFecha().isBefore(inicioDia))
            .toList();

        List<Venta> ventasSemana = todasMes.stream()
            .filter(v -> !v.getFecha().isBefore(inicioSemana))
            .toList();

        // Ventas por dia ultimos 7 dias (para grafica)
        List<ResumenResponse.VentaDiaStats> ventasPorDia = new ArrayList<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        for (int i = 6; i >= 0; i--) {
            OffsetDateTime desde = inicioDia.minusDays(i);
            OffsetDateTime hasta = desde.plusDays(1);
            List<Venta> delDia = ventaRepository.findEnPeriodo(desde, hasta).stream()
                .filter(v -> VentaEstado.COMPLETADA.equals(v.getEstado()))
                .toList();
            BigDecimal totalDia = delDia.stream()
                .map(Venta::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            ventasPorDia.add(new ResumenResponse.VentaDiaStats(
                desde.toLocalDate().format(fmt), totalDia, delDia.size()));
        }

        // Top 5 productos por unidades vendidas en el mes
        Map<Long, int[]> conteoProductos = new LinkedHashMap<>();
        Map<Long, String> nombreProductos = new HashMap<>();
        Map<Long, BigDecimal> ingresosProductos = new HashMap<>();
        for (Venta v : todasMes) {
            for (DetalleVenta d : v.getDetalles()) {
                Long pid = d.getProducto().getId();
                conteoProductos.computeIfAbsent(pid, k -> new int[]{0})[0] += d.getCantidad();
                nombreProductos.put(pid, d.getProducto().getNombre());
                ingresosProductos.merge(pid,
                    d.getPrecioUnitario().multiply(BigDecimal.valueOf(d.getCantidad())),
                    BigDecimal::add);
            }
        }
        List<ResumenResponse.ProductoTopVentas> top = conteoProductos.entrySet().stream()
            .sorted((a, b) -> b.getValue()[0] - a.getValue()[0])
            .limit(5)
            .map(e -> new ResumenResponse.ProductoTopVentas(
                e.getKey(),
                nombreProductos.get(e.getKey()),
                e.getValue()[0],
                ingresosProductos.getOrDefault(e.getKey(), BigDecimal.ZERO)
            ))
            .toList();

        // Diferencia promedio arqueos del mes (solo cerrados)
        List<ArqueoCaja> arqueosMes = arqueoCajaRepository
            .findAll(Sort.by(Sort.Direction.DESC, "fechaApertura")).stream()
            .filter(a -> !Boolean.TRUE.equals(a.getAbierto())
                && a.getFechaApertura() != null
                && !a.getFechaApertura().isBefore(inicioMes)
                && a.getDiferencia() != null)
            .toList();
        BigDecimal difPromedio = arqueosMes.isEmpty() ? BigDecimal.ZERO :
            arqueosMes.stream().map(ArqueoCaja::getDiferencia)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(arqueosMes.size()), 2, RoundingMode.HALF_UP);

        // Ingresos por método de pago (mes)
        BigDecimal efectivoMes = sumByMetodo(todasMes, "EFECTIVO");
        BigDecimal tarjetaMes = sumByMetodo(todasMes, "TARJETA");
        BigDecimal transferenciaMes = sumByMetodo(todasMes, "TRANSFERENCIA");

        return new ResumenResponse(
            toStats(ventasHoy),
            toStats(ventasSemana),
            toStats(todasMes),
            ventasPorDia,
            top,
            productoRepository.findStockBajo().size(),
            difPromedio,
            efectivoMes,
            tarjetaMes,
            transferenciaMes
        );
    }

    private ResumenResponse.VentasStats toStats(List<Venta> ventas) {
        BigDecimal total = ventas.stream().map(Venta::getTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new ResumenResponse.VentasStats(total, ventas.size());
    }

    private BigDecimal sumByMetodo(List<Venta> ventas, String metodo) {
        return ventas.stream()
            .filter(v -> metodo.equalsIgnoreCase(v.getMetodoPago()))
            .map(Venta::getTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
