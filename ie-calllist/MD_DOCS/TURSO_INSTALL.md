# Installing Turso CLI on Windows

## Automatic Installation (Recommended)

Run the following command in PowerShell:

```powershell
irm https://tur.so/install.ps1 | iex
```

After installation, restart your terminal.

## Manual Installation Options

If the automatic install fails, try one of these:

### Option 1: Chocolatey
```powershell
choco install turso
```

### Option 2: Scoop
```powershell
scoop install turso
```

### Option 3: Winget
```powershell
winget install --id ChiselStrike.Turso
```

### Option 4: Direct Download
1. Visit releases: https://github.com/tursodatabase/turso-cli/releases
2. Download the latest `turso-windows-amd64.exe`
3. Rename to `turso.exe`
4. Add to your system PATH
