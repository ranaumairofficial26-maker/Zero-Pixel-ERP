# ==========================================
# Zerp Pixels CRM - Backend Dockerfile (.NET 8)
# Multi-stage build with QuestPDF font support
# ==========================================

# Stage 1: Build & Publish
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project file and restore
COPY ["ZerpPixelsCRM.Api/ZerpPixelsCRM.Api.csproj", "ZerpPixelsCRM.Api/"]
RUN dotnet restore "ZerpPixelsCRM.Api/ZerpPixelsCRM.Api.csproj"

# Copy entire source code and build in Release mode
COPY ZerpPixelsCRM.Api/ ZerpPixelsCRM.Api/
WORKDIR "/src/ZerpPixelsCRM.Api"
RUN dotnet publish "ZerpPixelsCRM.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Install fontconfig and fonts for QuestPDF / SkiaSharp PDF rendering in Linux
RUN apt-get update && apt-get install -y --no-install-recommends \
    fontconfig \
    libfontconfig1 \
    fonts-liberation \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy published application
COPY --from=build /app/publish .

# Environment & Ports
ENV ASPNETCORE_URLS=http://+:5282
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 5282

ENTRYPOINT ["dotnet", "ZerpPixelsCRM.Api.dll"]

