!macro customHeader
  !system "echo '' > ${BUILD_RESOURCES_DIR}/customHeader"
!macroend

!macro preInit
  ; This macro is inserted at the beginning of the NSIS .OnInit callback
  !system "echo '' > ${BUILD_RESOURCES_DIR}/preInit"
!macroend

!macro customInit
  !system "echo '' > ${BUILD_RESOURCES_DIR}/customInit"
!macroend

!macro customInstall
  ; Step 1: Check if Docker Desktop is installed
  nsExec::ExecToStack 'Get-WmiObject -Query "SELECT * FROM Win32_Product WHERE Name = ''Docker Desktop''" | Select-Object -Property Name'
  Pop $0 ; Pop the result from the stack

  ; Check if Docker Desktop is installed
  StrCmp $0 "" NotInstalled DockerInstalled

NotInstalled:
  ; Docker Desktop is not installed
  MessageBox MB_OK "Docker Desktop is not installed. Please install Docker Desktop before continuing."
  Quit

DockerInstalled:
  ; Docker Desktop is installed
  DetailPrint "Docker Desktop is installed."
  Goto InternetCheck

InternetCheck:
  ; Step 2: Check internet connection
  ClearErrors
  nsExec::ExecToStack 'ping google.com -n 1'
  Pop $0 ; Pop the result from the stack

  ; Check if the ping was successful
  IfErrors NoInternet ConnectionEstablished

NoInternet:
  ; Internet connection not available
  MessageBox MB_OK "Internet connection is required. Please check your internet connection before continuing."
  Quit

ConnectionEstablished:
  ; Internet connection established
  DetailPrint "Internet connection established."

  ; Step 3: Execute deploy.ps1 using PowerShell
  File /oname=$PLUGINSDIR\deploy.ps1 "${BUILD_RESOURCES_DIR}\deploy.ps1"
  nsExec::ExecToLog '"powershell" -File "$PLUGINSDIR\deploy.ps1"'
  Pop $ExitCode
  Pop $StdOutText
  DetailPrint "Deployment complete."

!macroend


!macro customInstallMode
  # set $isForceMachineInstall or $isForceCurrentInstall
  # to enforce one or the other modes.
!macroend

!macro customWelcomePage
  # Welcome Page is not added by default for installer.
  !insertMacro MUI_PAGE_WELCOME
!macroend

!macro customUnWelcomePage
  !define MUI_WELCOMEPAGE_TITLE "custom title for uninstaller welcome page"
  !define MUI_WELCOMEPAGE_TEXT "custom text for uninstaller welcome page $\r$\n more"
  !insertmacro MUI_UNPAGE_WELCOME
!macroend
