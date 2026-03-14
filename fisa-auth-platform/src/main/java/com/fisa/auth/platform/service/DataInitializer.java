import com.fisa.auth.platform.repository.MemberRepository;
import com.fisa.auth.platform.domain.member.Member;
import com.fisa.auth.platform.domain.member.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final MemberRepository memberRepository;

    @Override
    public void run(String... args) throws Exception {
        if (memberRepository.findByUsername("kim@fisa.com").isEmpty()) {
            memberRepository.save(Member.builder()
                .username("kim@fisa.com")
                .password("{noop}1234")
                .role(Role.EMPLOYEE)
                .build());
            System.out.println("✅ kim@fisa.com initialized");
        }
        
        if (memberRepository.findByUsername("testuser").isEmpty()) {
            memberRepository.save(Member.builder()
                .username("testuser")
                .password("{noop}1234")
                .role(Role.ADMIN)
                .build());
            System.out.println("✅ testuser initialized");
        }
    }
}
