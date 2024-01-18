!macro customInstall
    MessageBox MB_OK "Custom Install Macro Called, the path is: $PLUGINSDIR"

    ; Copy all files from the BUILD_RESOURCES_DIR to the $PLUGINSDIR
    SetOutPath "$PLUGINSDIR"
    File /r "${BUILD_RESOURCES_DIR}\*.*"

    MessageBox MB_OK  "Executing PowerShell script..."
    ; switch to the $PLUGINSDIR\build\ directory
    SetOutPath "$PLUGINSDIR\build\"
    ; Execute the PowerShell script
    nsExec::ExecToStack  'powershell -ExecutionPolicy Bypass -File deploy.ps1'
    Pop $0 ; Get the return value
    Pop $1 ; Get the output
    StrCmp $0 "0" success ; Check if the return value is 0
    MessageBox MB_OK "Deployment failed. Output: $1"
    Goto done
    success:
    MessageBox MB_OK "Deployment complete. Output: $1"
    done:
!macroend