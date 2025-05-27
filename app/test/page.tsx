"use client";

import FAQ from "@/components/faq";
import { FillInBlank } from "@/components/fill-in-blank";
import { Quiz } from "@/components/quiz";

export default function TestPage() {
  const text = `Model Driven Engineering
Systematic use of models and their automated transformation throughout Hu
software Wecycle raising Hu level of abstraction to produce faster More reliable
and more evolvable systems. willi ensuring courishercy and conformance to rules.
Beverins: Sepernation of concerns adodel neurs aulo dated analysis. evaluation
consistency checking ebufor dance to well forwardness consmaints.
lifecyle 1 Phases : Requirements Evicitatien
specification and Analysis
Architecture
Design
Detailed Design Implementation and Deployment.
Chairacteristics
- Abstraction: highlight important aspechs emit relevant details.
- Undershaudability simplified human readable representations.
- Accuracy faithful representation of the real system.
- Predictive Power: enable reasoning and analysis of system behaviour.
- low cost: cheaper to build and evaluape than full inaplendantations.
- Model Roles:
- Descriptive: document existing systems and aid understanding
- Predictive : forecast system properties and behaviour.
- Perspective: specify new sydneas and sometimes drive code generation.
Types and levels of Abstraction:
levels:
- Structural Modelling: class and component diagnosis
System
Architeclare
Compo
neut.
- Behavioural Models : share Machines & activity diagramms.
- Intentional Models : goal and feature models.
- Configuration Models: deployment & internal blode diagnosus.
Shoure Bused Modelling
Ekuacuho: shares mausenbus eurry enit achious.
- Toleen firing mile when a transitions event-occups and gaurd is mue its achiew enecutes
the to lew to move to the trarget share.
Modelling language:
Programming language:
- emphasises description predi cpan level
- Focus on full precision and precise
communicatien.
implementatien
- canits low level implementation details.
Class Diagrams
Naming conventions: avoid complementation hurnas such as Data or Record.
Associations: link between two classes ; each end Must have a role hande-
- No duplicute linkes (set sementics) ; arrow on one end restricts direchbu of maversal.
Roles: labels end of am association: victim Ds officers
Reigication: Promote an association to a class when you need to attach attributes
Association Class When link itsdy has data. Avoids duplicates
Student
Course
Registration
Association
grade
class
Associations map to object references or collections do not duplicate therd as attributes.
Composition : strovy part-whole relationship;tied lyfecycle acyclic
Window
slider
Aggregation: weaker pourt-whole relationship notied lifecycle rarely used
Path
segnant
Player. Role Paltern: Use separate Role classes when object plays Mulliple notes.
<< alastrout>>
Player
Role
the roles can be something like
Full time I Parhime Students
Role 1
Role 2
Abstraction-Decurrence : Split coadmon (abstraction) vs corahoon information to avoid
duplication.
common ( TV Llow)
specific unjo
uso
Abstraction
*
Occurrence
( Epitrode Producer)
Roles have
Only one role
Different notes
Move than one
Design Pattern
different features
at a time
over time
role at Hu payde time
Enuperation
No
Yes
Yes
No
Subclasees.
Yes
Yes
No
No
Associations
No
Yes
Yes
Yes
Player - Role Pottern
Yes
Yes
Yes
Yes
Modelling Guidelines and Decision Criteria:
Class: when a concept has its own identity Wecycle and May be referenced independently.
basically y you need to atteela behaviour constraints or relationships.
Attribute: for simple inhiusic delra that exists only as a part of dr containing object.
avoid when the daha group has its own identity - in this case use class
Association: expressivy relationships between classes whose westances exist independently.
y the relationship they
Association Classes: the link between A and B has h Qwn attributes; enjora eracly one
instance of Uck per A - B pair. Do not use when: lickh is pure navigation grouping without
enha daha; or if multiple links per pair are allowed l'intentional
Player-Role Patter: Model when an object call play multiple changeable noles
with distinct features. Avoid subclassing for changing noles.
Alastroupion- Occurrence: Split shound and custance -specific dapo into two classes to avoid
duplication and enforce consistency.
Generalisation: is A Rule- Sub class quist always behave as super clas . Subclass must
add or restrict features meaningfully
From Problem to Description Moodel:
- Noun Analysis: enhaut candidate classes grord domain hernas.
- Verb Analysis: identify associations
- For each feature walk through a concrete scenanio to expose passing operations and relationships.
Multiplicity Accuracy: reflect real-world construits by examinity accuracy.
Minimal Modelling: Only Model what's needed for the system's shared require naenhs
to avoid over-engineering
Use qualified associations when our class identifies linkeed werences by a key.
Cousmainhs
for each Customer:
Cushowner
age > 18 and eye < 66
name: giving
title: string
is Mare campliles litk 'Mr.'
age : Integer
not is Male implies fitle 'Ms'
isMale. boteem
name. length () < 100
Associations:
for each Account:
Account
Transaction
Ht in self. transactions it is hrue
value Inheger
that t. value > 100.
Sawrugs Account
use dot operation to havigate an association or access an attribute.
self is only required if conspaint is avabi iguous. Not the case here
- cousmaints are defined ou the paodelling level and evaluaned on instances.
Collections:
Set : {1 2 3 4 Y - no duplicates Bey (T): duplicates allowed. (ordered does cuot
Navigating ordered association
f
*
1
*
Custanter
Account
Transaction
foretonity
(one ordered howersed
for each Customer:
for each Customer
sufficient)
account
onlevel set of accounts
account. transection oreleved bag of mous.
Single navigation reselvs in a Set / Ordered Set combined navigations
result in a Boy Navigation over associations with at least one annohaned
with {ondered reselles in a Boy.
Navigating Inhen hance: can directly haw gate associations of superclas
I
Account
I
Customer
Transaction
for eder special Account
11 account.customer X
Special Account
customer
Typical Shoute wruchs for Collections:
all collections:
seh or boys:
- six of collection
union : AU B. intersection An B.
- count of object in collection
difference of A with B
- collection includes I excludy objor collechio
(A willo ut AUB )
- collution is / is not empty.
symoupnic dig (ANB without A UB)
- collection plus I Minus object.
edell edeancet in an ordered collection has an inder
1st in ordered collection (4th)
appleud object to OC
last in orderel collection.
prepend object to OC.
M to nath in OC.
cusert as with ill OC
revoove nth from`
  return (
    <FAQ blockId="3dcebc5d-4087-4b14-8cd2-6e074b0baf2b" text={text} />
  );
}
