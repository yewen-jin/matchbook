export interface DemoInput {
	id: string;
	label: string;
	summary: string;
	text: string;
}

export const demoInputs: DemoInput[] = [
	{
		id: '01',
		label: 'Happy path — venue email',
		summary: 'Velvet Room, £350, 17 Jul, 14-day terms',
		text: `From: Marta Reyes <bookings@thevelvetroom.example>
To: Caslean
Subject: Re: Friday 17th — confirmed

Hi Caslean,

Great news — confirming you for the Friday 17 July residency slot, 9pm set.
Fee as discussed: £350, payable within 14 days of the gig. Invoice to this
address, marked for the attention of accounts.

Backline provided, soundcheck 6pm.

Best,
Marta
The Velvet Room`,
	},
	{
		id: '02',
		label: 'Multi-item — agency DM',
		summary: 'Halliday, £600 day rate + £120 usage, 30-day terms',
		text: `[Instagram DM — Halliday Model Management]

halliday.mgmt: Hi Cas! Campaign shoot confirmed for Mon 20 July, studio day
halliday.mgmt: Day rate £600 as per your card, plus £120 usage (12 months, UK digital)
halliday.mgmt: Invoice us the full £720 as usual, 30 day terms — we sort our commission our end
caslean: amazing!! see you monday 🖤
halliday.mgmt: Call sheet to follow. Don't forget the invoice this time 😅`,
	},
	{
		id: '03',
		label: 'Transcript noise — Zoom call',
		summary: 'Brightside Studios, £275 session, Thu 9 Jul',
		text: `[Zoom transcript — Brightside Studios call, 3 July 2026, 14:12]

Dom (Brightside): ...so yeah, the topline session, we're thinking Thursday the 9th if you're free?
Caslean: Thursday works, yeah. Afternoon?
Dom (Brightside): Perfect, um, 1 till 5. And we said £275 for the session, right, flat?
Caslean: £275, yep. Same as the last one.
Dom (Brightside): Cool cool cool. Just invoice the studio as usual, accounts will sort it end of month.
Caslean: Great, I'll send it over after the session.
Dom (Brightside): Legend. Okay I've got another call, see you Thursday.`,
	},
	{
		id: '04',
		label: 'Vague rate — asks, never guesses',
		summary: 'Velvet Room, "usual arrangement?", no amount stated',
		text: `[WhatsApp — Marta, The Velvet Room]

Marta: Cas! One of Friday's acts dropped out, 24th. Any chance you could do the acoustic slot?
Caslean: yes!! love that slot
Marta: You're a lifesaver. Usual arrangement?
Caslean: perfect 🙌
Marta: Great, 8pm, keep it to 40 min. See you then x`,
	},
	{
		id: '05',
		label: 'Duplicate booking',
		summary: 'Re-confirmation of the same 17 Jul gig as 01',
		text: `From: Marta Reyes <bookings@thevelvetroom.example>
To: Caslean
Subject: Friday 17th — running order

Hi Caslean,

Just confirming everything's set for your 9pm slot this Friday the 17th —
running order attached. As agreed, £350 for the set, invoice whenever suits.

See you at soundcheck!

Marta
The Velvet Room`,
	},
	{
		id: '06',
		label: 'Unknown client',
		summary: 'Nightshade Festival (not in Xero), £450, 8 Aug',
		text: `[Instagram DM — Nightshade Festival]

nightshade.fest: Hey Cas! Caught your Velvet Room set, would love you for the
festival — Sat 8 Aug, 6pm slot, 45 min
caslean: omg yes!! I'm in
nightshade.fest: Amazing. Fee's £450, you invoice us, 30 days from the show
date
caslean: perfect, I'll send it over after
nightshade.fest: See you there!`,
	},
];
