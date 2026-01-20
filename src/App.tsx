import { useEffect, useMemo, useState } from "react";
import { 
  Layout, 
  Typography, 
  List, 
  Card, 
  Tag, 
  Spin, 
  Alert, 
  Button, 
  message 
} from "antd";
import { Content, Header } from "antd/es/layout/layout";
import "./App.css";

import { ensureAnonSession } from "./lib/auth";
import { HOUSE_ID, USER_LABELS, USER_TO_NEXT } from "./config";

import { fetchChores, type ChoreRow } from "./util/chores";
import { applyPendingRotations } from "./util/rotations";
import { completeChore } from "./util/completeChore";
import { fetchCompletedChoreIdsSince } from "./util/completions";
import { weekStartSundayNoon, msUntilNextSundayNoon } from "./util/week";


const { Title, Text } = Typography;

function App() {
  const [loading, setLoading] = useState(true);
  const [chores, setChores] = useState<ChoreRow[]>([]);
  const [completedThisWeek, setCompletedThisWeek] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [rotatedId, setRotatedId] = useState<string | null>(null);


  const formatUser = useMemo(() => {
    return (userId: string | null) => {
      if (!userId) return "Unassigned";
      return USER_LABELS[userId] ?? userId.slice(0, 8);
    };
  }, []);

  async function reloadAll() {
    setLoading(true);
    setError(null);
    try {
      await ensureAnonSession();

      // At/after Sunday noon, apply any due rotations (weekly chores)
      await applyPendingRotations(HOUSE_ID);

      const data = await fetchChores(HOUSE_ID);
      setChores(data);

      const weekStartIso = weekStartSundayNoon().toISOString();
      const completedSet = await fetchCompletedChoreIdsSince({
        houseId: HOUSE_ID,
        sinceIso: weekStartIso,
      });
      setCompletedThisWeek(completedSet);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load chores");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      await reloadAll();
      if (cancelled) return;

      // Schedule an automatic refresh at Sunday 12pm
      const ms = msUntilNextSundayNoon();
      const t = window.setTimeout(() => {
        reloadAll();
      }, ms + 250);

      return () => window.clearTimeout(t);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onComplete(chore: ChoreRow) {
    const weekly = Boolean(chore.weekly);
    const locked = weekly && completedThisWeek.has(chore.id);
    if (locked) return;

    setCompletingId(chore.id);
    try {
      const { nextId } = await completeChore({
        houseId: HOUSE_ID,
        choreId: chore.id,
        curUserId: chore.cur_user_id,
        weekly,
      });

      // Update local UI immediately
      setChores((prev) =>
        prev.map((c) => {
          if (c.id !== chore.id) return c;

          if (!weekly) {
            return { ...c, cur_user_id: nextId, pending_user_id: null, pending_effective_at: null };
          } else {
            // weekly: keep cur_user_id displayed this week; pending fields show next
            return { ...c, pending_user_id: nextId };
          }
        })
      );

      // Weekly: lock button for everyone via completions table -> update local set too
      if (weekly) {
        setCompletedThisWeek((prev) => new Set(prev).add(chore.id));
      }

      setRotatedId(chore.id);
      window.setTimeout(() => setRotatedId(null), 650)
      message.success("Marked complete");
    } catch (e: any) {
      message.error(e?.message ?? "Failed to complete chore");
    } finally {
      setCompletingId(null);
    }
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Title level={3} style={{ color: "white", margin: 0 }}>
          Cench Chore Chart
        </Title>
      </Header>

      <Content style={{ padding: 16, maxWidth: 900, margin: "0 auto", width: "100%" }}>
        {error && (
          <Alert
            type="error"
            message="Error"
            description={error}
            showIcon
            style={{ marginBottom: 12 }}
          />
        )}

        {loading ? (
          <div style={{ padding: 32, display: "flex", justifyContent: "center" }}>
            <Spin size="large" />
          </div>
        ) : (
          <Card 
            className="chore-card"
          >
            <Title level={4} style={{ marginTop: 0 }}>
              Chores
            </Title>

            <List
              dataSource={chores}
              renderItem={(chore) => {
                const weekly = Boolean(chore.weekly);
                const locked = weekly && completedThisWeek.has(chore.id);

                // Display logic:
                // - weekly + pending exists => show current as this week's assignee (cur_user_id)
                //   and show next as pending_user_id
                // - non-weekly => show next from USER_TO_NEXT(cur_user_id)
                const displayCurId = chore.cur_user_id;
                const displayNextId = (displayCurId ? USER_TO_NEXT[displayCurId] ?? null : null);

                return (
                  <List.Item>
                    <Card
                      className={`chore-card ${rotatedId === chore.id ? "chore-rotated" : ""}`}
                      size="small"
                    >
                      <div className="chore-row">
                        <div className="chore-left">
                          <Text strong className="chore-title">
                            {chore.title}
                          </Text>
                          {weekly && (
                            <Text type="secondary" className="chore-weekly-badge">
                              Weekly
                            </Text>
                          )}
                        </div>

                        <div className="chore-right">
                          <div className="chore-assignment">
                            <Text className="chore-label">Assigned:</Text>
                            <Tag 
                              color={displayCurId ? "blue" : "default"} 
                              className={`chore-tag ${rotatedId === chore.id ? "tag-flip" : ""}`}
                            >
                              {formatUser(displayCurId)}
                            </Tag>
                          </div>

                          <div className="chore-next">
                            <Text type="secondary" className="chore-next-text">
                              Next: {displayNextId ? formatUser(displayNextId) : "—"}
                            </Text>
                          </div>

                          <div className="chore-actions">
                            <Button
                              type="primary"
                              size="small"
                              disabled={locked || completingId === chore.id}
                              loading={completingId === chore.id}
                              onClick={() => onComplete(chore)}
                              className={ locked ? "btn-completed" : "btn-active" }
                            >
                              {locked ? "Completed this week!" : "Complete chore"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </List.Item>
                );
              }}
            />
          </Card>
        )}
      </Content>
    </Layout>
  );
}

export default App;


