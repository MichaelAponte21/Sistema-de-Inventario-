package EntornosProgramacion.SistemaInventario.service;

import EntornosProgramacion.SistemaInventario.model.Producto;
import EntornosProgramacion.SistemaInventario.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class StockAlertService {

    private final ProductoRepository productoRepository;

    @Scheduled(cron = "0 0 8 * * MON-SAT")
    @Transactional(readOnly = true)
    public void verificarStockBajo() {
        List<Producto> bajos = productoRepository.findStockBajo();
        if (bajos.isEmpty()) return;

        log.warn("===== ALERTA STOCK BAJO: {} producto(s) por debajo del minimo =====", bajos.size());
        bajos.forEach(p ->
            log.warn("  - {} (ID {}): stock actual={}, minimo={}, deficit={}",
                p.getNombre(), p.getId(), p.getStock(), p.getStockMinimo(),
                p.getStockMinimo() - p.getStock())
        );
    }
}
