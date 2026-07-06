; YTSave Windows Installer
; Built with NSIS 3 on Linux (makensis) — no Wine required

Unicode True
SetCompressor /SOLID lzma
SetCompressorDictSize 64

!define APP_NAME      "YTSave"
!define APP_VERSION   "1.0.0"
!define APP_PUBLISHER "YTSave"
!define APP_URL       "https://ytsave.app"
!define APP_EXE       "YTSave.exe"
!define REG_KEY       "Software\${APP_PUBLISHER}\${APP_NAME}"
!define UNINSTALL_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}"

; Absolute paths injected at compile time via -D flags
!ifndef SRC_DIR
  !define SRC_DIR "PLACEHOLDER_SRC"
!endif
!ifndef ICO_FILE
  !define ICO_FILE "PLACEHOLDER_ICO"
!endif
!ifndef OUT_FILE
  !define OUT_FILE "PLACEHOLDER_OUT"
!endif

!include "MUI2.nsh"
!include "LogicLib.nsh"

; ---- MUI settings -----------------------------------------------------------
!define MUI_ABORTWARNING
!define MUI_ICON    "${ICO_FILE}"
!define MUI_UNICON  "${ICO_FILE}"

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "English"

; ---- General ----------------------------------------------------------------
Name              "${APP_NAME} ${APP_VERSION}"
OutFile           "${OUT_FILE}"
InstallDir        "$PROGRAMFILES64\${APP_NAME}"
InstallDirRegKey  HKCU "${REG_KEY}" "InstallDir"
RequestExecutionLevel user

; ---- Install section --------------------------------------------------------
Section "Install" SecInstall
  SetOutPath "$INSTDIR"
  File /r "${SRC_DIR}\*.*"

  WriteRegStr HKCU "${REG_KEY}" "InstallDir" "$INSTDIR"
  WriteRegStr HKCU "${REG_KEY}" "Version"    "${APP_VERSION}"

  WriteRegStr   HKCU "${UNINSTALL_KEY}" "DisplayName"     "${APP_NAME}"
  WriteRegStr   HKCU "${UNINSTALL_KEY}" "DisplayVersion"  "${APP_VERSION}"
  WriteRegStr   HKCU "${UNINSTALL_KEY}" "Publisher"       "${APP_PUBLISHER}"
  WriteRegStr   HKCU "${UNINSTALL_KEY}" "URLInfoAbout"    "${APP_URL}"
  WriteRegStr   HKCU "${UNINSTALL_KEY}" "UninstallString" '"$INSTDIR\Uninstall.exe"'
  WriteRegStr   HKCU "${UNINSTALL_KEY}" "InstallLocation" "$INSTDIR"
  WriteRegStr   HKCU "${UNINSTALL_KEY}" "DisplayIcon"     '"$INSTDIR\${APP_EXE}"'
  WriteRegDWORD HKCU "${UNINSTALL_KEY}" "NoModify"        1
  WriteRegDWORD HKCU "${UNINSTALL_KEY}" "NoRepair"        1

  WriteUninstaller "$INSTDIR\Uninstall.exe"

  CreateDirectory "$SMPROGRAMS\${APP_NAME}"
  CreateShortcut  "$SMPROGRAMS\${APP_NAME}\${APP_NAME}.lnk" "$INSTDIR\${APP_EXE}"
  CreateShortcut  "$SMPROGRAMS\${APP_NAME}\Uninstall.lnk"   "$INSTDIR\Uninstall.exe"
  CreateShortcut  "$DESKTOP\${APP_NAME}.lnk"                "$INSTDIR\${APP_EXE}"
SectionEnd

; ---- Uninstall section ------------------------------------------------------
Section "Uninstall"
  Delete "$DESKTOP\${APP_NAME}.lnk"
  Delete "$SMPROGRAMS\${APP_NAME}\${APP_NAME}.lnk"
  Delete "$SMPROGRAMS\${APP_NAME}\Uninstall.lnk"
  RMDir  "$SMPROGRAMS\${APP_NAME}"
  RMDir /r "$INSTDIR"
  DeleteRegKey HKCU "${REG_KEY}"
  DeleteRegKey HKCU "${UNINSTALL_KEY}"
SectionEnd
