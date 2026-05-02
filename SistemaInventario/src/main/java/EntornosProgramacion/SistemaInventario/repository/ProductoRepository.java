package EntornosProgramacion.SistemaInventario.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import EntornosProgramacion.SistemaInventario.model.Producto;

public interface ProductoRepository extends MongoRepository<Producto, String> {
    List<Producto> findByCategoriaId(String categoriaId);

    @Query("{ $expr: { $lte: ['$stock', '$stockMinimo'] } }")
    List<Producto> findStockBajo();
}
