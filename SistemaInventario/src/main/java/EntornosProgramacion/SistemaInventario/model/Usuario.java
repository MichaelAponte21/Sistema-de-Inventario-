package EntornosProgramacion.SistemaInventario.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Document(collection = "usuario")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario implements UserDetails {

    @Id
    private String id;

    private String nombre;

    private String email;

    @JsonIgnore
    private String password;

    @Builder.Default
    private Boolean activo = true;

    private LocalDateTime fechaCreacion;

    @DBRef
    private Rol rol;

    @DBRef
    @Builder.Default
    private List<MovimientoInventario> movimientos = new ArrayList<>();

    void prePersist() {
        if (fechaCreacion == null) {
            fechaCreacion = LocalDateTime.now();
        }
        if (activo == null) {
            activo = true;
        }
    }

    @Override
    @JsonIgnore
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + rol.getNombre().name()));
    }

    @Override
    @JsonIgnore
    public String getUsername() {
        return email;
    }

    @Override
    @JsonIgnore
    public boolean isAccountNonExpired() {
        return Boolean.TRUE.equals(activo);
    }

    @Override
    @JsonIgnore
    public boolean isAccountNonLocked() {
        return Boolean.TRUE.equals(activo);
    }

    @Override
    @JsonIgnore
    public boolean isCredentialsNonExpired() {
        return Boolean.TRUE.equals(activo);
    }

    @Override
    @JsonIgnore
    public boolean isEnabled() {
        return Boolean.TRUE.equals(activo);
    }
}
