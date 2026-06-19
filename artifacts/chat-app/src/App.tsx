import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import ChatList from "@/pages/chat-list";
import ChatDetail from "@/pages/chat-detail";
import ContactDetail from "@/pages/contact-detail";
import Calls from "@/pages/calls";
import Stories from "@/pages/stories";
import IosTabBar from "@/components/ios-tab-bar";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, createContext, useContext } from "react";
import { ThemeProvider } from "@/lib/theme";

function getDepth(path: string): number {
  if (path.startsWith("/contact")) return 2;
  if (path.startsWith("/chat")) return 1;
  return 0;
}

const NavDirectionContext = createContext<number>(1);
export function useNavDirection() { return useContext(NavDirectionContext); }

const DURATION = 0.24;
const EASE: [number, number, number, number] = [0.33, 1, 0.68, 1];

const pageVariants = {
  enter: (dir: number) => ({
    x: dir >= 0 ? "100%" : "-28%",
    zIndex: dir >= 0 ? 2 : 1,
  }),
  center: (dir: number) => ({
    x: "0%",
    zIndex: dir >= 0 ? 2 : 1,
    boxShadow: "none",
    transition: { type: "tween", ease: EASE, duration: DURATION },
  }),
  exit: (dir: number) => ({
    x: dir >= 0 ? "-28%" : "100%",
    zIndex: dir >= 0 ? 1 : 2,
    transition: { type: "tween", ease: EASE, duration: DURATION },
  }),
};

function getActiveTab(location: string): "Chats" | "Calls" | "Stories" | null {
  if (location === "/") return "Chats";
  if (location === "/calls") return "Calls";
  if (location === "/stories") return "Stories";
  return null;
}

function Router() {
  const [location] = useLocation();
  const prevLocation = useRef(location);
  const direction = useRef(1);

  const prevDepth = getDepth(prevLocation.current);
  const currDepth = getDepth(location);

  if (location !== prevLocation.current) {
    direction.current = currDepth >= prevDepth ? 1 : -1;
    prevLocation.current = location;
  }

  const dir = direction.current;
  const activeTab = getActiveTab(location);

  return (
    <NavDirectionContext.Provider value={dir}>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Animated page area — only this slides */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <AnimatePresence mode="sync" custom={dir}>
            <motion.div
              key={location}
              custom={dir}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              style={{
                position: "absolute",
                inset: 0,
                willChange: "transform",
                overflow: "hidden",
                boxShadow: dir >= 0 ? "-6px 0 18px rgba(0,0,0,0.18)" : "none",
              }}
            >
              <Switch location={location}>
                <Route path="/" component={ChatList} />
                <Route path="/calls" component={Calls} />
                <Route path="/stories" component={Stories} />
                <Route path="/chat/:id" component={ChatDetail} />
                <Route path="/contact/:id" component={ContactDetail} />
                <Route component={NotFound} />
              </Switch>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Tab bar — lives outside AnimatePresence, never moves */}
        {activeTab && <IosTabBar active={activeTab} />}
      </div>
    </NavDirectionContext.Provider>
  );
}

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
