# MODEL SELECTION RULES — Auto-optimize for cost + performance

**Default for Rico's main session: Sonnet 4.6**

## When to Use Each Model

### 🎯 Sonnet 4.6 (DEFAULT — $3/$15 per MTok)
**Use for 90% of work:**
- General chat, questions, brainstorming
- Code review, debugging, architecture
- Writing (docs, emails, marketing copy)
- Project planning, task breakdown
- Data analysis, research
- Multi-step reasoning (normal complexity)

### 🧠 Opus 4.6 ($15/$75 per MTok)
**Use ONLY when Rico explicitly asks OR when:**
- Extreme complexity (nested business logic, deep trade-offs)
- High-stakes decisions (legal review, major architecture)
- Creative writing requiring nuance (fiction, poetry)
- Complex mathematical proofs
- **Rico says:** "use opus", "need deep thinking", "this is critical"

### ⚡ Haiku 4.5 ($0.80/$4 per MTok)
**Use for simple, routine tasks:**
- File reading/parsing
- Simple categorization
- Format conversions
- Quick lookups
- Sub-agent work (file operations, git commits)

### 💰 DeepSeek V3 ($0.30/$0.88 per MTok via OpenRouter)
**Use for bulk work:**
- Processing large datasets
- Batch categorization (tax transactions, receipts)
- Template generation (100+ items)
- Content analysis at scale

### 🚀 Gemini Flash ($0.10/$0.40 per MTok via OpenRouter)
**Use for:**
- High-volume queries
- Real-time data fetching
- Multi-modal tasks (if needed)
- Experimental features

## Guidelines

1. **Default to Sonnet** unless there's a reason not to
2. **Switch down to Haiku** for simple file ops in loops
3. **Switch up to Opus** only when complexity justifies it
4. **Use DeepSeek/Flash** for bulk tasks with clear instructions

## If Uncertain

- Can Sonnet handle this? → Use Sonnet (95% yes)
- Is this a sub-task in a loop? → Use Haiku
- Did Rico say "important" / "critical"? → Stick with Sonnet (or Opus if he specified)

## Cost Targets

- **Main session:** < $5/day (Sonnet keeps this easy)
- **Heavy research days:** < $15/day (Opus only for key decisions)
- **Bulk processing:** Use DeepSeek/Flash to stay under $2 for 100K+ tokens

---

**When in doubt: Sonnet is almost always the right call.**
