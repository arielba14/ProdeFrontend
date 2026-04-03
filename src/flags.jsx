// src/flags.js
export const getFlag = (teamName) => {
  if (!teamName || typeof teamName !== "string") {
    return null; // 👈 evita error si llega undefined/null
  }  

  const map = {
    México: "mx",
    Sudáfrica: "za",
    "Corea del Sur": "kr",
    "República Checa":"cz",
    Suecia: "se",
    Turquía: "tr",
    Bosnia: "ba",
    Canadá: "ca",
    Qatar: "qa",
    Suiza: "ch",
    Brasil: "br",
    Marruecos: "ma",
    Haití: "ht",
    Escocia: "gb-sct",
    EEUU: "us",
    Australia: "au",
    Paraguay: "py",
    Alemania: "de",
    Curazao: "cw",
    "RD Congo": "cg",
    Irak: "iq",
    "Costa de Marfil": "ci",
    Ecuador: "ec",
    "Países Bajos": "nl",
    Japón: "jp",
    Túnez: "tn",
    Bélgica: "be",
    Egipto: "eg",
    Irán: "ir",
    "Nueva Zelanda": "nz",
    España: "es",
    "Cabo Verde": "cv",
    "Arabia Saudita": "sa",
    Uruguay: "uy",
    Francia: "fr",
    Senegal: "sn",
    Noruega: "no",
    Argentina: "ar",
    Argelia: "dz",
    Austria: "at",
    Jordania: "jo",
    Portugal: "pt",
    Uzbekistán: "uz",
    Colombia: "co",
    Inglaterra: "gb",
    Croacia: "hr",
    Ghana: "gh",
    Panamá: "pa"
  };

  const code = map[teamName];
  return code ? `https://flagcdn.com/w320/${code}.png` : null;
};