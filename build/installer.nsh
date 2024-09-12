RequestExecutionLevel admin
!macro customInstall
    SetOutPath "$TEMP"
    DetailPrint "Temporary directory: $TEMP"
    System::Call 'kernel32::OutputDebugString(t "Your message")'

    SetDetailsView show
    ; MessageBox MB_OK "Custom Install Macro Called, the path is: $PLUGINSDIR"
    ; Copy all files from the BUILD_RESOURCES_DIR to the $PLUGINSDIR
    ;DetailPrint  "Copy resource files..."
    ;SetOutPath "$PLUGINSDIR"
    ;MessageBox MB_OK "       Return value: ${BUILD_RESOURCES_DIR}"
    ;File /r "${BUILD_RESOURCES_DIR}\*.*"
    ; switch to the $PLUGINSDIR\build\ directory
    ; Execute the PowerShell script
    ; run this powershell command: Set-ExecutionPolicy RemoteSigned
    SetOutPath "$INSTDIR\resources\secote\"
    ;MessageBox MB_OK "       Return value: $INSTDIR\resources\secote\"
    ;nsExec::ExecToStack 'powershell -ExecutionPolicy Bypass -File deploy.ps1'
    ;DetailPrint  "Start pulling images..."
    ;nsExec::Exec 'powershell -ExecutionPolicy Bypass -File pull_images.ps1'
    DetailPrint  "Start installing conda environment..."
    nsExec::ExecToStack 'powershell -ExecutionPolicy Bypass -File deployEnv.ps1'
    ;print information about the ps1
    ;nsExec::ExecToStack 'powershell -ExecutionPolicy Bypass -File deployEnv.ps1'
    ;Pop $0 # return value/error/timeout
    ;Pop $1 # printed text, up to ${NSIS_MAX_STRLEN}
    ;MessageBox MB_OK ""
    ;MessageBox MB_OK "       Return value: $0"
    ;MessageBox MB_OK ""
    Pop $0
    StrCmp $0 "ok" 0 +3
    DetailPrint "Installation finished successfully"
    Goto +2
    DetailPrint "Failed to pull images."
!macroend