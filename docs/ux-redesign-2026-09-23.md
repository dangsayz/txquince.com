# TX Quince public journey: design evidence and implementation

## Source observations

At a 1372px live viewport, the old portfolio placed four roughly 210px photo columns beside a category rail. The photographs were too small to assess as a family. The live pricing hero layered a large headline over a darkened image, while the inquiry form began as an unframed grid with understated field boundaries. The homepage contained the date check below both shorts and gallery sections, despite date availability being its primary inquiry path.

## Reference patterns

- [Runway editorial hero](https://mobbin.com/sites/sections/1e3a2793-abc0-4bf6-a5ee-5ebcae362913): short message, generous white space, image as the focal point.
- [MOUTHWASH gallery](https://mobbin.com/sites/sections/9c2b6408-fce2-44db-9c0b-3def5bddba12): clear type filters and an airy photography grid.
- [Jobber request flow](https://mobbin.com/flows/13bc2f40-c708-4405-89a3-3a6e72376e07): narrow, labeled request form followed by an explicit next step.
- [Humble pricing](https://mobbin.com/sites/sections/e9df3537-2b5d-4399-883b-f916424c6e3d): visible inclusions and a repeated package action.

These are interaction and hierarchy references, not component copies.

## Shipped branch layout contract

| Surface | Desktop | Phone |
| --- | --- | --- |
| Shared shell | Up to 1440px wide, 40–64px gutters, readable navigation, 48px inquiry action | 20px gutters, 44px menu/date actions, lower sticky 48px inquiry action |
| Home hero | Equal copy/photo split; editorial serif headline, short 18px introduction, one primary inquiry action | Copy and action precede photo; body at least 16px |
| Portfolio | Slim filter rail and two substantial photo columns, natural image ratios | One photo column and horizontally scrolling category filters |
| Investment | Two spacious collection columns, inclusions in 16px text, Signature called out by contrast | Single column cards; collection action remains visible |
| Inquiry | Explanatory left column and bordered, labeled form right | Intro followed immediately by form; 48px fields and submit action |

Journey: **Home or portfolio → date inquiry (optional date carried into the form) → confirmation**. Families ready to choose a collection can still use the dedicated reserve route. The homepage date picker no longer guesses that a date is open when the availability data is unavailable.

## Release boundary

The checked-in Cloudflare booking branch is closer to production than `main`, but production has pages and copy absent from every published GitHub branch. The live Worker was most recently code-deployed on July 12; the booking branch ends July 2. Release this redesign only after the production source and routes are reconciled, so newer live behavior is preserved.
