package br.com.justina.application.usecases;

import br.com.justina.application.dto.RegisterRequest;
import br.com.justina.domain.model.Usuario;
import br.com.justina.domain.repository.UsuarioRepository;
import br.com.justina.infrastructure.exception.AuthenticationException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void register(RegisterRequest request) {

        if (usuarioRepository.existsByEmail(request.email())) {
            throw new AuthenticationException("Email ou senha inválidos");

        }

        Usuario usuario = new Usuario();
        usuario.setName(request.name());
        usuario.setEmail(request.email());
        usuario.setPassword(passwordEncoder.encode(request.password()));
        usuario.setRole(request.role());

        usuarioRepository.save(usuario);
    }


    public Usuario authenticate(String email, String rawPassword) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new AuthenticationException("Email ou senha inválidos"));

        if (!passwordEncoder.matches(rawPassword, usuario.getPassword())) {
            throw new AuthenticationException("Email ou senha inválidos");
        }

        return usuario;
    }

    public Optional<Usuario> findByEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }
}
