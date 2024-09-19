/* MAIN */

import { $, For } from "voby";

const PageHome = (): JSX.Element => {
  const languages = $([
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Français" },
    { code: "de", name: "Deutsch" },
  ]);

  const selectedLanguage = $("en");
  return (
    <select
      value={selectedLanguage()}
      onChange={(e) => selectedLanguage(e.target.value)}
      class="bg-primary border border-white/10 rounded p-2"
    >
      <For values={languages}>{(lang) => <option value={lang.code}>{lang.name}</option>}</For>
    </select>
  );
};

/* EXPORT */

export default PageHome;
