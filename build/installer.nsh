!macro customInstall
    SetOutPath "$TEMP"
    DetailPrint "Temporary directory: $TEMP"
    System::Call 'kernel32::OutputDebugString(t "Your message")'

    SetDetailsView show
    ; MessageBox MB_OK "Custom Install Macro Called, the path is: $PLUGINSDIR"
    ; Copy all files from the BUILD_RESOURCES_DIR to the $PLUGINSDIR
    DetailPrint  "Copy resource files..."
    SetOutPath "$PLUGINSDIR"
    File /r "${BUILD_RESOURCES_DIR}\*.*"
    ; switch to the $PLUGINSDIR\build\ directory
    ; Execute the PowerShell script
    ; run this powershell command: Set-ExecutionPolicy RemoteSigned
    SetOutPath "$PLUGINSDIR\build\"
    ;nsExec::ExecToStack 'powershell -ExecutionPolicy Bypass -File deploy.ps1'
    DetailPrint  "Start pulling images..."
    nsExec::Exec 'powershell -ExecutionPolicy Bypass -File pull_images.ps1'
    nsExec::Exec 'powershell -ExecutionPolicy Bypass -File pull_images.ps1'
    Pop $0
    StrCmp $0 "ok" 0 +3
    DetailPrint "Installation finished successfully"
    Goto +2
    DetailPrint "Failed to pull images."
!macroend