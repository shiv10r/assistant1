# LuxInfra — Deployment Guide

LuxInfra is an expense-tracking assistant for interior-design businesses. You chat with it
("site A paint exp = 5k"), it categorizes and stores every expense **locally** (SQLite — no
server database needed), shows structured tabular reports, exports them as **Excel / PDF / PNG**,
and emails a daily summary automatically.

## Solution layout

| Project | What it is | Runs on |
|---|---|---|
| `LuxInfra.Core` | Shared library — models, chat parser, category classifier, SQLite storage, report builder, Excel/PDF/PNG export | referenced by both apps |
| `LuxInfra` | .NET MAUI app (MVVM, CommunityToolkit.Mvvm) | Windows 10/11 + Android |
| `LuxInfra.Web` | Blazor Server web app | any browser |

Data storage is **local on every platform** (SQLite file):
- Windows: `%LOCALAPPDATA%\Packages\...\LocalState\luxinfra.db3` (unpackaged: `%LOCALAPPDATA%`)
- Android: app-private storage
- Web: `LuxInfra.Web/data/luxinfra.db3` on the machine hosting the site

---

## Prerequisites (build machine)

1. **.NET 10 SDK** — <https://dotnet.microsoft.com/download>
2. **MAUI workloads** (only for the Windows/Android app):
   ```powershell
   dotnet workload install maui-windows android
   ```
   (Installing Visual Studio 2026 with the ".NET Multi-platform App UI" workload does this for you.)
3. Nothing else — no database server, no cloud account.

Check your setup:
```powershell
dotnet --list-sdks
dotnet workload list
```

---

## 1) Windows desktop app

### Run for development
```powershell
cd MyAssistant
dotnet build LuxInfra/LuxInfra.csproj -f net10.0-windows10.0.19041.0
.\LuxInfra\bin\Debug\net10.0-windows10.0.19041.0\win-x64\LuxInfra.exe
```

### Ship to another PC
```powershell
dotnet publish LuxInfra/LuxInfra.csproj -f net10.0-windows10.0.19041.0 -c Release
```
Copy the folder `LuxInfra\bin\Release\net10.0-windows10.0.19041.0\win-x64\publish\`
to the target PC and run `LuxInfra.exe`. The target PC needs the
[.NET 10 Desktop Runtime](https://dotnet.microsoft.com/download/dotnet/10.0) (or use
`-p:SelfContained=true` to bundle it).

---

## 2) Android app (mobile)

### Build the APK
```powershell
dotnet publish LuxInfra/LuxInfra.csproj -f net10.0-android -c Release
```
The signed APK appears at:
```
LuxInfra\bin\Release\net10.0-android\publish\com.luxinfra.assistant-Signed.apk
```

### Install on a phone
**Option A — copy the APK**: send the `-Signed.apk` to the phone (WhatsApp/Drive/USB),
tap it, allow "Install unknown apps". Done.

**Option B — USB with developer mode**:
```powershell
adb install LuxInfra\bin\Release\net10.0-android\publish\com.luxinfra.assistant-Signed.apk
```

**Option C — Play Store**: build an `.aab` with `-p:AndroidPackageFormat=aab`, sign with your
own keystore, and upload via the Play Console (requires a one-time $25 developer account).

---

## 3) Web app

### Run locally
```powershell
dotnet run --project LuxInfra.Web/LuxInfra.Web.csproj --urls http://localhost:5210
```
Open <http://localhost:5210>. Excel/PDF/PNG downloads work from the report panel.

### Serve on your office network (so anyone can use it)
```powershell
dotnet run --project LuxInfra.Web/LuxInfra.Web.csproj --urls http://0.0.0.0:5210
```
Others on the same Wi-Fi open `http://<your-pc-ip>:5210`
(find your IP with `ipconfig`). Allow port 5210 in Windows Firewall the first time.

### Deploy to a server / cloud
```powershell
dotnet publish LuxInfra.Web/LuxInfra.Web.csproj -c Release -o publish-web
```
The `publish-web` folder runs anywhere with `dotnet LuxInfra.Web.dll`:
- **IIS**: install the .NET 10 Hosting Bundle, point a site at the folder.
- **Linux VPS**: `dotnet LuxInfra.Web.dll` behind nginx, or a systemd service.
- **Azure App Service**: `az webapp up` or deploy the folder via VS/GitHub Actions.

> The web app keeps its data in `data/luxinfra.db3` inside the app folder — back that
> single file up and you've backed up everything.

---

## 4) Daily email report (Windows/Android app)

1. Open **⚙️ Settings** in the app.
2. The report email is pre-filled; change it if needed.
3. **Without SMTP**: at the configured time (default 8 PM) the app opens your mail app
   with the report pre-filled — one tap to send.
4. **With SMTP (fully automatic)**: fill in
   - Host: `smtp.gmail.com`, Port: `587`
   - User: your Gmail address
   - Password: a [Gmail App Password](https://myaccount.google.com/apppasswords)
     (requires 2-step verification; regular passwords won't work)
5. Tap **Save**, then **Send today's report** to test. Emails include the PDF report attached.

---

## 5) Using the assistant

| You type | What happens |
|---|---|
| `site A paint exp = 5k` | logs ₹5,000, category **Paint**, Site A |
| `site B glass and tiles 100000` | logs ₹1,00,000, category **Glass & Mirror** |
| `client Sharma site C labour 25k` | logs with the client attached |
| `show report` / `send me complete report now` | structured table right in the chat |
| `total` / `total site a` | running totals |
| `email report` | emails the report |
| `undo` | removes the last entry |

Amounts understand `5k`, `1.5l` / `lakh`, `2cr`, commas, and `rs`/`₹` prefixes.
Categories are auto-classified into buckets like Paint, Tiles & Flooring, Labour,
Electrical, Plumbing, Wood & Carpentry, Furniture, Transport, Equipment, Hardware, etc.

**Reports tab** (📑): filter Today / 7 days / Month / All time, see the table with
per-category and per-site summaries, and download **Excel / PDF / PNG** — on Windows files
land in your Downloads folder; on Android the share sheet opens.

---

## Troubleshooting

- **Build error "file in use"** — close the running LuxInfra.exe before rebuilding.
- **Android build slow the first time** — it downloads platform bits once; later builds are fast.
- **SMTP fails with Gmail** — you must use an App Password, not your login password.
- **Web app port busy** — change `--urls http://localhost:PORT`.
