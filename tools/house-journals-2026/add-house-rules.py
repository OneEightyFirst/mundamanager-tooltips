"""Rebuild House journal rules from the complete 2026 journal PDFs."""
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
rules = json.loads((ROOT/'rules.json').read_text())
previous_meta = json.loads((ROOT/'house-rules.json').read_text()) if (ROOT/'house-rules.json').exists() else {}
# These keys belong to this generator. Removing them first lets a fresh scan replace
# the former screenshot/transcript-derived records without touching core rules.
rules = {name: text for name, text in rules.items() if name not in previous_meta}
meta = {}
added = {}

def add(name, text, house, category, printed, pdf_page):
    filename = ('Necromunda_Skirmish_journal_Esher_2026.pdf' if house == 'Escher'
                else 'Necromunda Skirmish 2026 House of Chains - Goliath Journal.pdf')
    source = f'{filename}, printed p. {printed}; PDF p. {pdf_page}'
    added[name] = f'{category} — {house}. {text}\n\nSource: {source}.'
    meta[name] = {'house': house, 'category': category, 'source': source}

def batch(house, category, printed, pdf_page, rows):
    for name,text in rows: add(name,text,house,category,printed,pdf_page)

batch('Escher','Finesse skill',43,45,[
('Acrobatic','Fighter only. While Active, may move over enemy Fighters, but must obey the 1" rule at the end of movement. May cross barricades or obstacles up to 2" high without a movement reduction.'),
('Deadly Blows','Fighter only. When resolving close combat attacks, if this Fighter’s modified Initiative exceeds that of every other model in the combat, one Injury die may be re-rolled when resolving damage inflicted by this Fighter.'),
("Let's Dance",'Fighter only. After performing a Fight action, may replace the Consolidate move with a Free Shoot action using a weapon with the Light trait.'),
('Lightning Reflexes','Fighter only. Gains a 5+ Invulnerable save against Hits suffered during close combat. Treats Retreat as a Free action.'),
('Perfect Strike','Fighter only. When performing a Fight action, may select just one weapon instead of declaring Primary and Secondary weapons. Make one attack with it regardless of Attacks, modifiers or other skills, resolved as if WS were 2+.'),
('Somersault','Fighter only. While Active, may perform Somersault (Double): place this Fighter anywhere within 6" of its current position. The destination must be visible before moving, and placement must obey the 1" rule.')])
batch('Goliath','Muscle skill',43,44,[
('Fists of Steel','Fighter only. Always armed with fists of steel, which use no weapon slots. Profile: SR E; LR -; Str S+2; AP -; L 2; Melee.'),
('Ground Pound','Fighter only. While Active, may perform Shockwave (Double): roll D6 + Strength. On a total of at least 6, all OTHER Active Fighters within 6", friend and foe, become Suppressed.'),
('Immovable Object','Fighter only. During activation, may perform Stand Firm (Double): until the start of its next activation, apply +2 to Armour Saves. This Fighter cannot be moved from its current location by any means and cannot be Suppressed.'),
('Tireless Worker','Fighter only. When performing the Work Territory Post-cycle Action, add an additional 10 credits to the gang’s Stash.'),
('Unleash the Beast','Fighter only. May perform Flex while Engaged. Flex (Double): all other Fighters within 1", friend or foe, must pass a Strength check or be pushed D3" directly away. Stop only on contact with another Fighter or impassable terrain. Test for falling if pushed off a ledge. This Fighter’s controller chooses the order if several Fighters are pushed.'),
('Unstoppable Force','Fighter only. In an activation in which this Fighter performs a Charge action, all its Melee weapons also gain Knockback (4+), and it may consolidate an additional 2".')])
add('Finesse','Primary Skill Set for all Fighters in Escher gangs and Escher variants. D6: 1 Acrobatic; 2 Deadly Blows; 3 Let’s Dance; 4 Lightning Reflexes; 5 Perfect Strike; 6 Somersault. Each skill is Fighter only.','Escher','Skill access',43,45)
add('Muscle','Primary Skill Set for all Fighters in Goliath gangs and Goliath variants. D6: 1 Fists of Steel; 2 Ground Pound; 3 Immovable Object; 4 Tireless Worker; 5 Unleash the Beast; 6 Unstoppable Force. Each skill is Fighter only.','Goliath','Skill access',43,44)
add('Gene-smithing','When recruited, a Goliath Fighter without the Beast Subtype may buy ONE option. Apply its cost to recruitment cost and Credit Value, including negative costs. Options can only be bought on recruitment. A Forge Master with Paragon of the Vats may buy one additional option (two total).','Goliath','Gene-smithing','40-41',42)
for name,cost,text in [
('Adaptive Biology',15,'May re-roll Strength or Toughness checks. Successful Wound rolls against this Fighter from Toxin (X+) weapons must be re-rolled.'),
('Adaptive Mind',5,'Counts Secondary Skill Sets as Primary when rolling on the Advancements table.'),
('Data-slug Overlay',-10,'On its first activation of the battle, make an Intelligence check. On failure, this Fighter gains Insanity.'),
('Iron Flesh',30,'Increase Wounds by 1.'),
('Overdeveloped Musculature',10,'Increase Strength by 1; reduce Movement and Initiative by 1.'),
('Over-engineered',-10,'Roll twice for this Fighter’s Lasting Injury and apply the higher result. Cannot be combined with Redundant Organs.'),
('Reduced Bone Density',-10,'Reduce Toughness by 1.'),
('Redundant Organs',15,'Roll twice for this Fighter’s Lasting Injury and apply the lower result. Cannot be combined with Over-engineered.'),
('Scar Tissue',15,'Reduce the Lethality of all hits suffered by 1, to a minimum of 1.'),
('Stimm Implant',10,'When activating, may increase Strength by 2 until the end of the round. If used, roll D6 during the Bottle Checks step of the End phase: on 4+, suffer a Str -, AP -, L1 Hit that automatically Wounds and ignores Saves.'),
('Survivor',10,'May re-roll one Injury die when making Recovery tests for this Fighter.')]:
    add(name,f'{cost:+d} credits. Recruitment only; Goliath Fighter without Beast Subtype. {text}','Goliath','Gene-smithing','40-41',42)

chem_use = 'Each purchased elixir supplies one use per Cycle and is available again next Cycle. All Escher Fighters, including variants, have access. '
stimm_use = 'May start the battle under this stimm if equipped, or an Active bearer may use Administer Dose (Single) on itself or a friendly Fighter within 1". Effects expire at Post-battle Wrap-up. '
add('Chem-alchemy',chem_use+'Stimms can be administered during battle; gaseous ammo and poisons are applied after crews are selected.','Escher','Chem-alchemy','40-41','42-43')
add('Administer Dose',stimm_use+chem_use,'Escher','Action',40,42)
for name,cost,text in [
('Blood Rush',15,'When administered, the recipient immediately regains 1 Wound lost earlier in the battle.'),
('Grace',20,'Increase Initiative by 1 and apply +1 to Agility tests. If the Fighter ends an activation less than 3" from where it started, it suffers a Str 2, AP -2, L1 Hit.'),
('Hyper',20,'Increase Movement by 2", increased to 3" when performing a Charge. Reduce all Hit rolls by 1.')]:
 add(name,f'{cost} credits. {text}\n\n{stimm_use}{chem_use}','Escher','Stimm',40,42)
for name,cost,text in [
('Hallucinogen',20,'If an Injury die is rolled for a Fighter wounded by this weapon, that Fighter makes a Willpower check; on failure, it gains Insanity.'),
('Lifting',25,'Requires both Gas and Template. The template may be placed up to 6" from the attacker. Its narrow end must point directly towards the attacker and its wide end must be the furthest part from the attacker.'),
('Pyrophoric',20,'The weapon gains Blaze (5+).')]:
 add(name,f'{cost} credits. {text}\n\nApply to an equipped Gas weapon during Pre-battle after crews are selected. Lasts until Post-battle Wrap-up. {chem_use}','Escher','Gaseous ammo',41,43)
for name,cost,text in [
('Exploding',20,'If a Fighter is taken Out of Action by a hit from this weapon, before removing it centre a 3" Blast marker on its base. All models touched suffer an immediate Str -, AP -, L1 Hit with Gas and Toxin (3+).'),
('Irradiating',20,'The weapon gains Rad-phage.'),
('Paralysing',15,'A Fighter Wounded by this weapon must immediately make a Toughness check. On failure, it becomes Webbed.')]:
 add(name,f'{cost} credits. {text}\n\nApply to an equipped Toxin (X+) weapon during Pre-battle after crews are selected. Lasts until Post-battle Wrap-up. {chem_use}','Escher','Poison',41,43)

batch('Escher','Equipment',48,50,[
('Auto-chem','Exclusive; 30 credits; Chem Wytch only in the House addenda. Treat Administer Dose as a Free action.'),
('Multi-harness','Exclusive; 20 credits; Huntress only in the supplied lists. Equipped weapons with Light also gain Reliable.'),
('Servo-medicae','Exclusive; 30 credits. An Active bearer may perform Auto-medicate (Free): target itself or a friendly Active or Suppressed Fighter within 3". Make an Intelligence check for the bearer; on success the target regains 1 Wound lost earlier in the battle. The same rule appears in both released journals. Access: Chem Wytch in House Escher addenda; Forge Patcher in House Goliath/Furnace Brutes lists; Forge Patcher or Unborn Doc in Unborn.')])
meta['Servo-medicae']['house']='Escher / Goliath'
added['Servo-medicae']=added['Servo-medicae'].replace('Equipment — Escher.','Equipment — Escher / Goliath.')
servo_source = ('Necromunda_Skirmish_journal_Esher_2026.pdf, printed p. 48; PDF p. 50; '
                'Necromunda Skirmish 2026 House of Chains - Goliath Journal.pdf, printed p. 48; PDF p. 50')
meta['Servo-medicae']['source'] = servo_source
added['Servo-medicae'] = added['Servo-medicae'].rsplit('\n\nSource:',1)[0] + '\n\nSource: ' + servo_source + '.'
batch('Goliath','Equipment',48,50,[
('Chem Slugger','Exclusive; 45 credits. An Active bearer may perform Chem Slug (Single): target a friendly Fighter within 2". During its next activation the target may perform an additional action. At the end of that activation roll D6: on 4+, no further effect; on 1–3, it suffers a Str -, AP -, L1 Hit that automatically Wounds, with no saves allowed. Forge Patcher only in House Goliath/Furnace Brutes; Forge Patcher or Unborn Doc in Unborn.'),
('Medi Skull','Exclusive; 45 credits, Unborn Doc only in the supplied list. Represent with a model within 1" of the owner. After any owner movement, may reposition within 1". T 3, Save 6+; can be targeted as a Fighter. If Wounded, remove it for this battle; it is available in future battles. While present, the owner may perform either Treat Ally or Heal Ally as a Free action once per activation, even if Injured/Damaged.')])
add('Auto-medicate','Requires an Active Fighter equipped with servo-medicae. Free action: target itself or a friendly Active or Suppressed Fighter within 3". Make an Intelligence check for the acting Fighter; on success, the recipient regains 1 Wound lost earlier in the battle.','Goliath','Action',48,50)
add('Chem Slug','Requires an Active chem slugger bearer. Single action: target a friendly Fighter within 2"; it may perform one additional action during its next activation. At the end of that activation, roll D6: 1–3 causes a Str -, AP -, L1 Hit that automatically Wounds with no saves; 4+ has no further effect.','Goliath','Action',48,50)
batch('Goliath','Action',43,44,[
('Shockwave','Requires Ground Pound and an Active Fighter. Double action: roll D6 + Strength. On 6+, all OTHER Active Fighters within 6", friend and foe, become Suppressed.'),
('Stand Firm','Requires Immovable Object. Double action during activation: +2 to Armour Saves until the start of the next activation; cannot be moved by any means or Suppressed.'),
('Flex','Requires Unleash the Beast; usable while Engaged. Double action: all other Fighters within 1", friend or foe, pass a Strength check or are pushed D3" directly away. Stop only at another Fighter or impassable terrain; test for falling at ledges. The acting Fighter’s controller chooses the order.')])
batch('Goliath','Special rule',30,32,[
('Fires of the Forge','Furnace Brutes may always purchase weapons and wargear from the Trading Post as if a Fighter had performed Visit Trading Post. This grants no TP.'),
('Smiths of Renown','Furnace Brutes Fighters may perform the Enhance Weapon Post-cycle Action.')])
add('Outsiders','On recruitment, Unborn Fighters without the Beast Subtype select one additional Skill Set as a Secondary Skill Set.','Goliath','Special rule',34,36)
batch('Goliath','Special rule','36-37',38,[
('Master of the Forge','The Forge Despot may perform one additional Post-cycle Action, which must be Enhance Weapon.'),
('Paragon of the Vats','On recruitment, the Forge Master may purchase one additional Gene-smithing upgrade. Together with the general allowance of one, this permits two total.')])
add('Sure-footed','All Wyld Hunt Fighters may re-roll failed Agility tests.','Escher','Special rule',30,32)
batch('Escher','Special rule',34,36,[
('Deadly Poisons','All weapons with Toxin (X+) and without Shred (X+) wielded by Chymist Cult Fighters gain Shred (6+).'),
('Rites of the Moraegan','Chymist Cult Fighters may perform the Death Rites Post-cycle Action.')])
add('Chem-alchemy Adept','On recruitment, an Escher Chem Mother adds one Chem-alchemy Elixir to her equipment for free.','Escher','Special rule',37,39)
add('Death Rites','Chymist Cult Fighter only. Resolve at the start of Update Roster. Select another Fighter in the gang who is not already a Death-Maiden and has Champion, Ganger, Leader or Prospect. The target may have suffered Critical Injury or Memorable Death this cycle, but may not perform Post-cycle Actions or be targeted by Medical Escort. Pay 60 credits and make an Intelligence check for the acting Fighter.\n\nFailure: delete the target from the roster and place its equipment in the Stash. Success: remove all Lasting Injuries, increase Toughness by 1, make it a Death-Maiden for all purposes, change Type to Fighter (Champion, Loner), and grant Poison Blood (Gangs of the Underhive p. 37). It may keep now-ineligible equipment but cannot be given additional such equipment.','Escher','Post-cycle action',48,50)
add('Enhance Weapon','Furnace Brutes Fighter only. Select a Primitive Weapon or Repurposed Tool with Melee that the Fighter carries or that is in the Stash. Pay 10 credits and select one permanent change:\n• If it lacks Unwieldy: +1 Lethality and add Unwieldy.\n• If it lacks both Heavy and Paired: +1 Strength and add Heavy.\n• Add Concussive (6+) if absent; otherwise reduce X by 1, minimum 4.\n• Improve AP by 1, to a minimum of -2.\n• If it has Heavy but lacks Knockback, add Knockback (6+); if it already has Knockback, reduce X by 1, minimum 4.\nEach change increases the weapon’s Credit Value by 5.','Goliath','Post-cycle action',48,50)

batch('Goliath','Weapon',47,48,[
('Ignition Cannon','Profile: SR 5"; LR 10"; Str 6; AP -2; L 2; Ammo (6+), Blaze (5+), Damage (2). 110 credits in supplied lists.'),
('Crucible Hooks','Profile: SR E; LR -; Str S+1; AP -2; L 2; Melee, Paired (2). 60 credits; Forge Breaker only in House addenda/Furnace Brutes.'),
('Forge Axe','Profile: SR E; LR -; Str S+1; AP -1; L 2; Heavy, Melee, Parry, Unwieldy. 45 credits; Forge Breaker only in House addenda/Furnace Brutes.'),
('Forge Hammer','Profile: SR E; LR -; Str S+1; AP -; L 3; Heavy, Knockback (5+), Melee, Unwieldy. 45 credits in supplied lists.'),
('Servo-arm','Profile: SR E; LR -; Str S+3; AP -; L 2; Concussive (5+), Melee, Unwieldy. 65 credits in supplied lists.')])
batch('Escher','Weapon',47,49,[
('Needle Sniper','Profile: SR 18"; LR 36"; Str -; AP -2; L 1; Toxin (3+). 60 credits in House addenda/Wyld Hunt.'),
('Repeater Needle Rifle','Profile: SR 9"; LR 18"; Str -; AP -1; L 1; Rapid Fire (1), Toxin (3+). 55 credits; Gun Maiden only in House addenda.'),
('Sharpened Claws','Profile: SR E; LR -; Str -; AP -1; L 1; Melee, Toxin (3+). Alpha Phelynx is armed with these.'),
('Nox Servo-claw','Profile: SR E; LR -; Str S+2; AP -1; L 1; Melee, Shred (5+). Cost depends on list: 40 credits in House addenda, 45 in Wyld Hunt.'),
('Khimerix Sting','Profile: SR E; LR -; Str -; AP -1; L 1; Melee, Paired (2), Toxin (3+). 45 credits; Blade Maiden only in supplied lists.'),
('Heavy Wyld Bow','Profile: SR 18"; LR 36"; Str 4; AP -1; L 1; no traits. 50 credits. Ammo profiles (all SR 18", LR 36", L 1):\nAcid: Str 4, AP -1; Ammo (4+), Blaze (5+).\nExplosive: Str 3, AP -1; Ammo (4+), Blast (3"), Unstable.\nMulti-shot: Str 4, AP -1; Ammo (3+), Rapid Fire (1).\nPoison: Str -, AP -; Ammo (4+), Toxin (3+). Buy ammo only if offered by the gang’s equipment list.'),
('Wyld Bow','Profile: SR 9"; LR 18"; Str 3; AP -; L 1; Assault. 15 credits. Ammo profiles (all SR 9", LR 18", AP -, L 1):\nAcid: Str 3; Ammo (4+), Assault, Blaze (5+).\nExplosive: Str 2; Ammo (4+), Assault, Blast (3"), Unstable.\nMulti-shot: Str 3; Ammo (3+), Assault, Rapid Fire (1).\nPoison: Str -; Ammo (4+), Assault, Toxin (3+).\nSmoke: Str -; Ammo (3+), Blast (3"), Smoke (no Assault). Buy ammo only if offered by the gang’s equipment list.')])

# Only merge entries owned by this update; refuse accidental core replacements.
for name,text in added.items():
    if name in rules and rules[name] != text:
        raise ValueError(f'Refusing to replace existing rule: {name}')
rules.update(added)
(ROOT/'rules.json').write_text(json.dumps(rules,ensure_ascii=False,indent=2)+'\n')
(ROOT/'house-rules.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n')
print(f'{len(added)} House entries; {len(rules)} rules total')
