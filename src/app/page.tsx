import { StartInterviewButton } from "@/components/start-interview-button";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles["glow-blob"]} />
        <div className="container">
          <div className={styles["hero-content"]}>
            <span className={styles["hero-badge"]}>
              v2.0 Now Available: System Design Support
            </span>
            <h1>
              Crush your next
              <br />
              <span className="text-gradient">Technical Interview.</span>
            </h1>
            <p>
              The world's first AI-powered interviewer trained on 10M+ LeetCode
              solutions and FAANG system architecture diagrams. Get real-time
              feedback, voice interaction, and detailed code analysis.
            </p>

            <div className={styles["hero-buttons"]}>
              <StartInterviewButton />
              <button className="btn btn-outline">View Demo</button>
            </div>
          </div>

          {/* Interactive Code Visual */}
          <div className={styles["ide-mockup"]}>
            <div className={styles["ide-header"]}>
              <div className={`${styles.dot} ${styles.red}`} />
              <div className={`${styles.dot} ${styles.yellow}`} />
              <div className={`${styles.dot} ${styles.green}`} />
              <span
                style={{
                  marginLeft: "10px",
                  fontSize: "0.8rem",
                  color: "#666",
                }}
              >
                interview_session.py
              </span>
            </div>
            <div className={styles["ide-body"]}>
              <span className={`${styles["code-line"]} ${styles.comment}`}>
                # AI: Can you optimize this solution for O(n) time?
              </span>
              <span className={styles["code-line"]}>
                <span className={styles.keyword}>def</span>{" "}
                <span className={styles.function}>two_sum</span>
                (nums, target):
              </span>
              <span className={styles["code-line"]}>
                {" "}
                prev_map = &#123;&#125;
              </span>
              <span className={styles["code-line"]}>
                <span className={styles.keyword}> for</span> i, n{" "}
                <span className={styles.keyword}>in</span>{" "}
                <span className={styles.function}>enumerate</span>
                (nums):
              </span>
              <span className={styles["code-line"]}> diff = target - n</span>
              <span className={styles["code-line"]}>
                <span className={styles.keyword}> if</span> diff{" "}
                <span className={styles.keyword}>in</span> prev_map:
              </span>
              <span className={styles["code-line"]}>
                <span className={styles.keyword}> return</span> [prev_map[diff],
                i]
              </span>
              <span className={styles["code-line"]}> prev_map[n] = i</span>
              <span className={styles["code-line"]}>
                <span className={styles.keyword}> return</span>{" "}
                <span className={styles.cursor} />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.stats}>
        <div className="container">
          <div className={styles["stats-grid"]}>
            <div className="stat-item">
              <h3>$250k+</h3>
              <p>Avg. Offer Received</p>
            </div>
            <div className="stat-item">
              <h3>50+</h3>
              <p>Programming Languages</p>
            </div>
            <div className="stat-item">
              <h3>10k+</h3>
              <p>Mock Interviews Daily</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className="container">
          <div className={styles["section-title"]}>
            <h2>Engineered for Engineers</h2>
            <p>
              Everything you need to pass L5+ interviews at Top Tech companies.
            </p>
          </div>

          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.icon}>⚡</div>
              <h3>Real-time Voice AI</h3>
              <p>
                Speak naturally. Our AI understands technical jargon,
                interrupts, and clarifying questions just like a human
                interviewer.
              </p>
            </div>

            <div className={styles.card}>
              <div className={styles.icon}>🏗️</div>
              <h3>System Design Canvas</h3>
              <p>
                Draw architecture diagrams on a collaborative whiteboard while
                the AI critiques your scalability and trade-off choices.
              </p>
            </div>

            <div className={styles.card}>
              <div className={styles.icon}>🔍</div>
              <h3>Deep Code Analysis</h3>
              <p>
                Don't just pass tests. Receive feedback on code cleanliness,
                variable naming, and time/space complexity optimization.
              </p>
            </div>

            <div className={styles.card}>
              <div className={styles.icon}>🏢</div>
              <h3>Company Specifics</h3>
              <p>
                Tailor the mock interview tone and question style to specific
                companies like Google, Netflix, Meta, or High-Frequency Trading
                firms.
              </p>
            </div>

            <div className={styles.card}>
              <div className={styles.icon}>📊</div>
              <h3>Performance Metrics</h3>
              <p>
                Get a detailed breakdown of your soft skills, technical
                accuracy, and problem-solving speed after every session.
              </p>
            </div>

            <div className={styles.card}>
              <div className={styles.icon}>🛡️</div>
              <h3>Cheat Detection</h3>
              <p>
                Practice in a secured environment. Our browser lockdown mode
                ensures you aren't relying on external help, simulating real
                pressure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className="container">
          <p>&copy; 2024 DevMock AI Inc. All systems operational.</p>
          <p style={{ marginTop: "10px", fontSize: "0.8rem", opacity: 0.6 }}>
            Made for developers, by developers.
          </p>
        </div>
      </footer>
    </div>
  );
}
