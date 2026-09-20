import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router";
import Rail from "./components/Rail";
import WrapUp from "./components/WrapUp";
import Attempt from "./screens/Attempt";
import Desk from "./screens/Desk";
import Track from "./screens/Track";
import Module from "./screens/Module";
import Review from "./screens/Review";
import Debrief from "./screens/Debrief";
import Shipped from "./screens/Shipped";
import { getDue, subscribeEvents } from "./api";
import { useStore } from "./store";

export default function App() {
  const loadHealth = useStore((s) => s.loadHealth);
  const loadDesk = useStore((s) => s.loadDesk);
  const loadSession = useStore((s) => s.loadSession);
  const startSession = useStore((s) => s.startSession);
  const bumpVault = useStore((s) => s.bumpVault);
  const health = useStore((s) => s.health);
  const desk = useStore((s) => s.desk);
  const session = useStore((s) => s.session);
  const revision = useStore((s) => s.vaultRevision);

  const [dueCount, setDueCount] = useState(0);
  const [wrapping, setWrapping] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    void loadHealth();
    void loadSession();
    void loadDesk();
    return subscribeEvents(() => bumpVault());
  }, [loadHealth, loadSession, loadDesk, bumpVault]);

  useEffect(() => {
    getDue()
      .then((d) => setDueCount(d.length))
      .catch(() => setDueCount(0));
  }, [revision, session]);

  const begin = async (moduleId: string) => {
    await startSession(moduleId);
    navigate(`/modules/${moduleId}`);
  };

  // The rail's own start uses the module the warm-up already points at.
  const railTarget = desk?.warmup[0]?.module_id ?? desk?.first_action?.module_id ?? null;

  return (
    <div className="shell">
      <Rail
        dueCount={dueCount}
        shipped={
          desk
            ? {
                exist: desk.standing.artefacts_exist,
                total: desk.standing.artefacts_total,
              }
            : null
        }
        vaultGit={health ? health.vault_git : null}
        onWrapUp={() => setWrapping(true)}
        onStart={() => railTarget && void begin(railTarget)}
        canStart={Boolean(railTarget)}
      />
      <main className="page">
        <Routes>
          <Route path="/" element={<Desk onStart={begin} />} />
          <Route path="/track" element={<Track />} />
          <Route path="/modules/:id" element={<Module />} />
          <Route path="/modules/:id/checks/:checkId" element={<Attempt />} />
          <Route path="/review" element={<Review />} />
          <Route path="/review/weekly" element={<Debrief />} />
          <Route path="/shipped" element={<Shipped />} />
          <Route path="/plan" element={<Navigate to="/track" replace />} />
          <Route path="/modules" element={<Navigate to="/track" replace />} />
          <Route path="/capstone" element={<Navigate to="/shipped" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {wrapping ? (
        <WrapUp
          onDone={() => {
            setWrapping(false);
            navigate("/");
          }}
        />
      ) : null}
    </div>
  );
}
