    ; List all files under $PLUGINSDIR
    ; Initialize variables
    StrCpy $0 "" ; Initialize the search handle
    StrCpy $1 "" ; Initialize the filename variable

    ; Start the search
    FindFirst $0 $1 $PLUGINSDIR\*.*
    loopFile:
        StrCmp $1 "" doneloopFile
        MessageBox MB_OK "File: $1"
        DetailPrint $1
        FindNext $0 $1
        Goto loopFile
    doneloopFile:
    FindClose $0