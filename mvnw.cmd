@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    https://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@REM ----------------------------------------------------------------------------
@REM Maven Start Up Batch script for Windows
@REM ----------------------------------------------------------------------------

@IF "%DEBUG%" == "" @ECHO OFF
@SETLOCAL

SET ERROR_CODE=0

@REM Set local scope for the variables with windows NT shell
IF "%OS%"=="Windows_NT" @SETLOCAL

@REM ==== START VALIDATION ====
IF NOT "%JAVA_HOME%" == "" GOTO OkJHome

FOR /F "tokens=2 delims==" %%I IN ('"SET JAVA_HOME" 2^>NUL') DO SET JAVA_HOME=%%I
IF NOT "%JAVA_HOME%" == "" GOTO OkJHome

@REM Fallback: find java from where
FOR /F "delims=" %%I IN ('where java 2^>NUL') DO (
    SET "JAVACMD=%%I"
    GOTO OkJavaCmd
)

ECHO Error: JAVA_HOME is not set and no 'java' command could be found in your PATH.
GOTO error

:OkJHome
IF NOT "%JAVACMD%"=="" GOTO OkJavaCmd
SET "JAVACMD=%JAVA_HOME%\bin\java.exe"

:OkJavaCmd
IF EXIST "%JAVACMD%" GOTO chkMHome
ECHO Error: JAVA_HOME is set to an invalid directory: "%JAVA_HOME%"
GOTO error

:chkMHome
SET "MAVEN_PROJECTBASEDIR=%~dp0"
IF "%MAVEN_PROJECTBASEDIR:~-1%"=="\" SET "MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR:~0,-1%"

SET "WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"
SET "WRAPPER_PROPERTIES=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.properties"

IF EXIST "%WRAPPER_JAR%" GOTO runMaven

@REM Try to download maven-wrapper.jar using powershell
ECHO Downloading Maven Wrapper...
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar', '%WRAPPER_JAR%')}"

IF NOT EXIST "%WRAPPER_JAR%" (
    ECHO Error: Could not download maven-wrapper.jar. Please ensure internet access is available.
    GOTO error
)

:runMaven
"%JAVACMD%" "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" -cp "%WRAPPER_JAR%" org.apache.maven.wrapper.MavenWrapperMain %*
IF ERRORLEVEL 1 GOTO error
GOTO end

:error
SET ERROR_CODE=1

:end
@EXIT /B %ERROR_CODE%
