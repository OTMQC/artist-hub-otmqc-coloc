// ArtistHub.js (abrégé pour export)
import React, { useState, useEffect } from "react";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function ArtistHub() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [adminMode, setAdminMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordList, setPasswordList] = useState([]);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(null);
  const [securityAlert, setSecurityAlert] = useState(false);

  useEffect(() => {
    const storedAuth = localStorage.getItem("otmqc-authenticated");
    const storedAdmin = localStorage.getItem("otmqc-admin");
    const storedPasswords = JSON.parse(localStorage.getItem("otmqc-passwords")) || [];
    const storedLock = localStorage.getItem("otmqc-locked-until");

    if (storedAuth === "true") setAuthenticated(true);
    if (storedAdmin === "true") setAdminMode(true);
    if (storedLock) setLockedUntil(new Date(storedLock));

    setPasswordList(storedPasswords);
  }, []);

  const handleLogin = () => {
    const now = new Date();
    if (lockedUntil && now < new Date(lockedUntil)) {
      setError("Trop de tentatives. Réessayez après 20 minutes.");
      return;
    }

    const storedPasswords = JSON.parse(localStorage.getItem("otmqc-passwords")) || [];
    const trimmedPassword = password.trim();

    if (storedPasswords.includes(trimmedPassword)) {
      setAuthenticated(true);
      localStorage.setItem("otmqc-authenticated", "true");
      setError("");
      setLoginAttempts(0);
    } else if (trimmedPassword === "admin-otmqc") {
      setAdminMode(true);
      localStorage.setItem("otmqc-admin", "true");
      setLoginAttempts(0);
    } else {
      const attempts = loginAttempts + 1;
      setLoginAttempts(attempts);
      if (attempts >= 3) {
        const lockTime = new Date(Date.now() + 20 * 60 * 1000);
        setLockedUntil(lockTime);
        localStorage.setItem("otmqc-locked-until", lockTime.toISOString());
        sendSecurityAlert();
        setSecurityAlert(true);
        setError("Trop de tentatives. Accès verrouillé pendant 20 minutes.");
      } else {
        setError("Mot de passe invalide. Veuillez réessayer.");
      }
    }
  };

  const sendSecurityAlert = () => {
    fetch("https://formspree.io/f/mnqevpda", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        _subject: "🔐 Tentatives échouées - Hub OTMQC",
        message: "Une adresse a tenté de se connecter 3 fois sans succès. Accès verrouillé pendant 20 minutes.",
        to: "julien@onthemapqc.com, guillaume@onthemapqc.com"
      })
    });
  };

  const handleAddPassword = () => {
    const updatedList = [...passwordList, newPassword.trim()];
    setPasswordList(updatedList);
    localStorage.setItem("otmqc-passwords", JSON.stringify(updatedList));
    setNewPassword("");
  };

  if (adminMode) {
    return (
      <div className="min-h-screen bg-white p-6 md:p-12 lg:p-24 grid gap-6">
        <motion.h1 className="text-3xl font-bold text-center">🔧 Interface Admin – Gestion des mots de passe</motion.h1>
        {securityAlert && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            ⚠️ Une tentative de connexion échouée 3 fois a été détectée. Accès verrouillé pendant 20 minutes.
          </div>
        )}
        <Card className="max-w-xl mx-auto">
          <CardContent className="p-6 grid gap-4">
            <Input
              type="text"
              placeholder="Nouveau mot de passe à ajouter"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Button onClick={handleAddPassword}>Ajouter</Button>
            <div>
              <h2 className="text-lg font-semibold mt-4">Mots de passe existants :</h2>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                {passwordList.map((pw, idx) => (
                  <li key={idx} className="text-sm text-gray-700">{pw}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ... Le reste du code reste inchangé (connexion, formulaire artistes, ressources, etc.) ...
}
