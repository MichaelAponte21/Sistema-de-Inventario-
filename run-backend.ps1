$proc = Start-Process -FilePath "c:\Users\MichaelAponte\Documents\Visual\Sistema-de-Inventario-\SistemaInventario\mvnw.cmd" `
    -ArgumentList "spring-boot:run", "-f", "c:\Users\MichaelAponte\Documents\Visual\Sistema-de-Inventario-\SistemaInventario\pom.xml" `
    -RedirectStandardOutput "c:\Users\MichaelAponte\Documents\Visual\Sistema-de-Inventario-\stdout.log" `
    -RedirectStandardError "c:\Users\MichaelAponte\Documents\Visual\Sistema-de-Inventario-\stderr.log" `
    -NoNewWindow -PassThru -Wait
Write-Host "Exit code: $($proc.ExitCode)"
