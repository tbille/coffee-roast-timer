import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { Helmet } from "react-helmet-async";
import { PageTitle } from "@/components/PageTitle";
import { RoastConsole } from "@/components/roast/console/RoastConsole";
import { useRoaster } from "@/contexts/RoasterContext";
import { useMigration } from "@/hooks/useMigration";
import { IMPLEMENTED_ROASTERS, isImplementedRoaster } from "@/utils/roasterRegistry";

const RoastTimer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentRoaster, switchRoaster } = useRoaster();
  const [searchParams, setSearchParams] = useSearchParams();
  const [linkNonce, setLinkNonce] = useState(0);

  useMigration();

  const roasterParam = searchParams.get("roaster");
  const refId = searchParams.get("ref");

  // A shareable link (/roast?roaster=…&ref=…) wins over the remembered machine.
  // `roaster` is consumed; `ref` stays in the URL so a reload keeps the reference.
  useEffect(() => {
    if (!roasterParam) return;
    if (isImplementedRoaster(roasterParam)) switchRoaster(roasterParam);
    const next = new URLSearchParams(searchParams);
    next.delete("roaster");
    setSearchParams(next, { replace: true });
    setLinkNonce((n) => n + 1);
  }, [roasterParam, searchParams, setSearchParams, switchRoaster]);

  // Any new ?ref= (e.g. "Roast again" while a finished roast is on screen) also counts as a new link.
  useEffect(() => {
    if (refId) setLinkNonce((n) => n + 1);
  }, [refId]);

  // Machine picked on the landing page
  useEffect(() => {
    const roasterType = (location.state as { roasterType?: string } | null)?.roasterType;
    if (!roasterType) return;
    if (isImplementedRoaster(roasterType)) switchRoaster(roasterType);
    navigate({ pathname: location.pathname, search: location.search }, { replace: true, state: null });
    setLinkNonce((n) => n + 1);
  }, [location.pathname, location.search, location.state, navigate, switchRoaster]);

  const clearRefParam = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("ref");
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  const roasterType = isImplementedRoaster(currentRoaster) ? currentRoaster : IMPLEMENTED_ROASTERS[0];

  return (
    <>
      <PageTitle
        title="Roast"
        description="A roast timer you can read from across the room: one tap for yellowing, first crack and drop, machine controls logged as you go, every batch saved."
      />
      <Helmet>
        <link rel="canonical" href="https://roast-timer.com/roast" />
      </Helmet>
      <RoastConsole
        roasterType={roasterType}
        onRoasterChange={switchRoaster}
        refId={refId}
        onClearRefParam={clearRefParam}
        linkNonce={linkNonce}
      />
    </>
  );
};

export default RoastTimer;
