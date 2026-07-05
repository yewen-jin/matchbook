<svelte:head>
	<title>Matchbook — you got the gig, we'll do the paperwork</title>
	<meta
		name="description"
		content="Paste the DM, the email, the call transcript. Matchbook turns a booking conversation into a correct Xero invoice — contact resolved, duplicates checked, nothing written until you approve it."
	/>
</svelte:head>

<div class="matchbook">
	<!-- Cover -->
	<section class="panel panel--dark" id="cover">
		<div class="inner cover-inner">
			<p class="stamp">Bounty 01 · Rise of the Builder</p>
			<h1 class="wordmark"><span class="ink-foil">Match</span><span class="ink-paper">book</span></h1>
			<p class="tagline">You got the gig. We'll do the paperwork.</p>
			<p class="lede">
				Paste the DM, the email, the call transcript. Matchbook turns it into a correct Xero
				invoice — contact resolved, duplicates checked, nothing written until you say strike it.
			</p>
			<div class="cta-block">
				<a class="cta" href="/app">Strike it up <span aria-hidden="true">→</span></a>
				<p class="cta-caption">Opens the live paste-box demo</p>
			</div>
		</div>
	</section>

	<!-- Striker strip / problem -->
	<section class="panel panel--light panel--strip" id="problem">
		<div class="inner">
			<p class="eyebrow">The strike strip</p>
			<h2 class="heading">Three hustles. Zero appetite for admin.</h2>
			<p class="prose">
				Caslean is a musician. She also runs a Depop shop, and models on the side. Every booking
				arrives differently — a promoter's email, an agency DM, a call that ends with
				&ldquo;I'll sort the invoice later.&rdquo; Later never comes on time. Invoices go out late,
				or wrong, or not at all — and admin steals hours from the three things she's actually good
				at.
			</p>
		</div>
	</section>

	<!-- How it works -->
	<section class="panel panel--dark" id="how-it-works">
		<div class="inner">
			<p class="eyebrow eyebrow--on-dark">Inside the flap</p>
			<h2 class="heading heading--on-dark">How it strikes</h2>
			<ol class="steps">
				<li class="step">
					<span class="step__number">01</span>
					<span class="step__body">
						<span class="step__title">Paste</span>
						Drop in the booking conversation, verbatim — no forms, no forwarding rules, whatever
						channel it arrived on.
					</span>
				</li>
				<li class="step">
					<span class="step__number">02</span>
					<span class="step__body">
						<span class="step__title">Extract</span>
						Client, date, rate and deliverables come out with every field traced back to the phrase
						it came from.
					</span>
				</li>
				<li class="step">
					<span class="step__number">03</span>
					<span class="step__body">
						<span class="step__title">Resolve</span>
						The client is checked against Xero contacts, and anything that looks like a duplicate
						invoice gets flagged.
					</span>
				</li>
				<li class="step">
					<span class="step__number">04</span>
					<span class="step__body">
						<span class="step__title">Ask, or approve</span>
						Missing a rate? Ambiguous client? It asks. Otherwise, one tap approves the draft.
					</span>
				</li>
				<li class="step">
					<span class="step__number">05</span>
					<span class="step__body">
						<span class="step__title">Write &amp; verify</span>
						The invoice is created in Xero, then re-read to confirm it landed — reasoning logged to
						its history.
					</span>
				</li>
			</ol>
		</div>
	</section>

	<!-- Matchsticks / income streams -->
	<section class="panel panel--light" id="streams">
		<div class="inner">
			<p class="eyebrow">Three sticks, one book</p>
			<h2 class="heading">Every hustle, invoiced the same way.</h2>
			<ul class="sticks">
				<li class="stick-row">
					<span class="stick" aria-hidden="true"><span class="stick__body"></span><span class="stick__head"></span></span>
					<span class="stick-copy">
						<span class="stick-copy__label">Music</span>
						Gig fees, deposits, split guarantees — booked over DM, invoiced never.
					</span>
				</li>
				<li class="stick-row">
					<span class="stick" aria-hidden="true"><span class="stick__body"></span><span class="stick__head"></span></span>
					<span class="stick-copy">
						<span class="stick-copy__label">Depop</span>
						Custom commissions and repeat wholesale asks, buried in buyer messages.
					</span>
				</li>
				<li class="stick-row">
					<span class="stick" aria-hidden="true"><span class="stick__body"></span><span class="stick__head"></span></span>
					<span class="stick-copy">
						<span class="stick-copy__label">Modelling</span>
						Agency day rates and usage fees — always &ldquo;net 30, invoice to follow.&rdquo;
					</span>
				</li>
				<li class="stick-row stick-row--lit">
					<span class="stick stick--lit" aria-hidden="true"><span class="stick__body"></span><span class="stick__head"></span></span>
					<span class="stick-copy">
						<span class="stick-copy__label">Matchbook</span>
						The strike that turns any of them into a line in the ledger.
					</span>
				</li>
			</ul>
		</div>
	</section>

	<!-- Back cover / trust + CTA -->
	<section class="panel panel--dark" id="back-cover">
		<div class="inner">
			<blockquote class="trust">
				Anyone can build an agent that talks. The hard part is one you'd trust near real money.
				Matchbook shows its provenance, asks when it isn't sure, and never touches the ledger
				without your sign-off.
			</blockquote>
			<div class="cta-block">
				<a class="cta" href="/app">Strike it up <span aria-hidden="true">→</span></a>
			</div>
			<p class="fine-print">
				Built for Rise of the Builder — Xero App &amp; Agent Hackathon · Encode Hub · 4–5 July 2026
			</p>
		</div>
	</section>
</div>

<style>
	:global(body) {
		margin: 0;
		background: #1a130e;
	}

	.matchbook {
		font-family: var(--font-body);
	}

	.panel {
		position: relative;
		padding: clamp(3.5rem, 8vw, 6.5rem) 1.5rem;
	}

	.panel + .panel::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 0;
		border-top: 2px dashed var(--seam, var(--stock-line));
	}

	.panel--dark {
		background: var(--cover);
		color: var(--paper);
		--seam: var(--cover-line);
	}

	.panel--light {
		background: var(--stock);
		color: var(--ink);
		--seam: var(--stock-line);
	}

	.panel--strip {
		background-image:
			repeating-linear-gradient(
				135deg,
				rgba(33, 26, 20, 0.08) 0px,
				rgba(33, 26, 20, 0.08) 2px,
				transparent 2px,
				transparent 10px
			),
			linear-gradient(var(--stock), var(--stock));
	}

	.inner {
		max-width: 42rem;
		margin: 0 auto;
	}

	.stamp {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		color: var(--foil);
		margin: 0 0 2rem;
	}

	.wordmark {
		font-family: var(--font-display);
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: -0.01em;
		font-size: clamp(2.75rem, 9vw, 5rem);
		line-height: 0.95;
		margin: 0;
		text-wrap: balance;
		animation: rise 0.7s ease-out both;
	}

	.ink-foil {
		color: var(--foil);
	}

	.ink-paper {
		color: var(--paper);
	}

	.tagline {
		font-family: var(--font-body);
		font-style: italic;
		font-size: clamp(1.1rem, 2.4vw, 1.4rem);
		margin: 1rem 0 0;
		color: var(--paper);
		animation: rise 0.7s ease-out 0.08s both;
	}

	.lede {
		font-size: 1.05rem;
		line-height: 1.65;
		max-width: 34ch;
		margin: 1.5rem 0 0;
		color: rgba(244, 238, 223, 0.85);
		animation: rise 0.7s ease-out 0.16s both;
	}

	.cta-block {
		margin-top: 2.25rem;
		animation: rise 0.7s ease-out 0.24s both;
	}

	.cta {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-family: var(--font-mono);
		font-weight: 700;
		font-size: 0.95rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--cover);
		background: var(--foil);
		border-radius: 999px;
		padding: 0.85rem 1.6rem;
		text-decoration: none;
		position: relative;
		overflow: hidden;
		isolation: isolate;
		transition: color 0.2s ease;
	}

	.cta::before {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(circle at 15% 50%, var(--flame), transparent 70%);
		opacity: 0;
		transform: scale(0.6);
		transition:
			opacity 0.35s ease,
			transform 0.35s ease;
		z-index: -1;
	}

	.cta:hover::before,
	.cta:focus-visible::before {
		opacity: 1;
		transform: scale(1.4);
	}

	.cta:hover,
	.cta:focus-visible {
		color: var(--paper);
	}

	.cta:focus-visible {
		outline: 2px solid var(--paper);
		outline-offset: 3px;
	}

	.cta-caption {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: rgba(244, 238, 223, 0.55);
		margin: 0.75rem 0 0;
	}

	.eyebrow {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		color: #8a6d1e;
		margin: 0 0 0.75rem;
	}

	.eyebrow--on-dark {
		color: var(--foil);
	}

	.heading {
		font-family: var(--font-display);
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: -0.005em;
		font-size: clamp(1.7rem, 4vw, 2.4rem);
		line-height: 1.1;
		margin: 0 0 1.5rem;
		text-wrap: balance;
	}

	.heading--on-dark {
		color: var(--paper);
	}

	.prose {
		font-size: 1.05rem;
		line-height: 1.7;
		max-width: 38ch;
		margin: 0;
	}

	.steps {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
	}

	.step {
		display: flex;
		gap: 1.25rem;
		padding: 1.1rem 0;
		border-top: 1px solid var(--cover-line);
	}

	.step:first-child {
		border-top: none;
	}

	.step__number {
		font-family: var(--font-mono);
		font-variant-numeric: tabular-nums;
		font-size: 1.1rem;
		font-weight: 700;
		color: var(--foil);
		flex-shrink: 0;
		width: 2.25rem;
	}

	.step__body {
		font-size: 0.98rem;
		line-height: 1.6;
		color: rgba(244, 238, 223, 0.8);
	}

	.step__title {
		display: block;
		font-family: var(--font-display);
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		font-size: 0.95rem;
		color: var(--paper);
		margin-bottom: 0.2rem;
	}

	.sticks {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.stick-row {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	.stick {
		flex-shrink: 0;
		width: 1.6rem;
		height: 4.5rem;
		position: relative;
		display: block;
	}

	.stick__body {
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 0.32rem;
		height: 3.5rem;
		background: #b89a6a;
		border-radius: 1px;
	}

	.stick__head {
		position: absolute;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 0.85rem;
		height: 1.15rem;
		border-radius: 50% 50% 45% 45%;
		background: #6b1f1f;
	}

	.stick--lit .stick__head {
		background: var(--flame);
		box-shadow:
			0 0 10px 3px rgba(196, 69, 58, 0.55),
			0 0 22px 8px rgba(201, 162, 39, 0.3);
		animation: flicker 2.4s ease-in-out infinite;
	}

	.stick-copy {
		font-size: 0.95rem;
		line-height: 1.55;
		max-width: 32ch;
	}

	.stick-copy__label {
		display: block;
		font-family: var(--font-mono);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-size: 0.78rem;
		color: #8a6d1e;
		margin-bottom: 0.2rem;
	}

	.stick-row--lit .stick-copy__label {
		color: var(--flame);
	}

	.trust {
		font-family: var(--font-body);
		font-style: italic;
		font-size: clamp(1.1rem, 2.6vw, 1.4rem);
		line-height: 1.6;
		max-width: 36ch;
		margin: 0;
		color: var(--paper);
	}

	.fine-print {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: rgba(244, 238, 223, 0.45);
		margin-top: 3rem;
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(0.75rem);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes flicker {
		0%,
		100% {
			box-shadow:
				0 0 10px 3px rgba(196, 69, 58, 0.55),
				0 0 22px 8px rgba(201, 162, 39, 0.3);
		}
		50% {
			box-shadow:
				0 0 8px 2px rgba(196, 69, 58, 0.45),
				0 0 16px 6px rgba(201, 162, 39, 0.22);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.wordmark,
		.tagline,
		.lede,
		.cta-block {
			animation: none;
		}
		.stick--lit .stick__head {
			animation: none;
		}
		.cta::before {
			transition: none;
		}
	}
</style>
