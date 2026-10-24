// Adresse publique du site, pour les redirections côté serveur.
//
// Derrière Nginx, l'application voit son adresse interne (https://localhost:3021) : un
// `new URL(chemin, request.url)` ou `origin` renvoie alors le visiteur vers localhost, qui n'existe
// que sur le serveur. On construit donc toujours les redirections à partir de l'adresse publique.

const FALLBACK = "https://qrcode-express.com";

/** Origine publique (sans barre finale), nettoyée d'un éventuel BOM provenant du fichier .env. */
export function siteOrigin(): string {
  const raw = (process.env.NEXT_PUBLIC_APP_URL || FALLBACK)
    .replace(/^﻿/, "")
    .replace(/^ï»¿/, "")
    .trim();
  return raw.replace(/\/+$/, "");
}

/** Adresse absolue publique d'un chemin du site, ex. absoluteUrl("/qr-introuvable"). */
export function absoluteUrl(path: string): URL {
  return new URL(path, `${siteOrigin()}/`);
}
