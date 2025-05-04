# Implementation Guide for UKMLA-Aligned Question Generation

## Setting Up Mistral AI for Medical Question Generation

To effectively use Mistral AI for generating medical SAQs aligned with the UKMLA framework, follow this structured approach:

## 1. Initial Setup Prompt

```
You are an experienced medical educator tasked with creating high-quality short answer questions (SAQs) for undergraduate medical students. Your questions should assess clinical reasoning, knowledge application, and professional judgment across the medical curriculum.

Please follow the comprehensive guidelines I'm about to share for creating questions that align with national medical licensing standards. These questions will be used for formative and summative assessment of medical students in various years of training.
```

## 2. Core Content Coverage

For comprehensive curriculum coverage, structure question generation across these key areas:

### Primary Domains
- **Applied Clinical Knowledge**: 40% of questions
- **Clinical Skills & Procedural Competence**: 30% of questions
- **Professional Capabilities**: 30% of questions

### Content Distribution
- **Common & Important Conditions**: 60% of questions
- **Acute & Emergency Presentations**: 25% of questions
- **Long-term & Chronic Conditions**: 15% of questions

## 3. Question Quality Control Guidelines

When generating questions, consider these essential quality factors:

1. **Authenticity**:
   - Base scenarios on realistic clinical encounters
   - Include appropriate complexity for the target year level
   - Avoid artificial or contrived scenarios

2. **Clinical Reasoning Focus**:
   - Test application rather than recall of isolated facts
   - Incorporate decision-making elements
   - Challenge students to interpret and synthesize information

3. **Integration**:
   - Connect basic science concepts with clinical applications
   - Include psychosocial and ethical dimensions where appropriate
   - Consider systems-level factors in management decisions

4. **Discrimination Capacity**:
   - Include questions of varying difficulty
   - Design questions that differentiate between levels of competence
   - Avoid extreme difficulty that tests obscure knowledge

## 4. Curriculum Mapping Matrix

For each question generated, consider placement within this curriculum mapping matrix:

| Clinical Domain | Foundational<br>(Years 1-2) | Developing<br>(Years 3-4) | Advanced<br>(Years 5-6) |
|----------------|--------------------------|------------------------|----------------------|
| Medicine       | Basic mechanisms         | Common presentations    | Complex management   |
| Surgery        | Surgical principles      | Core surgical conditions| Surgical decision-making |
| Pediatrics     | Normal development       | Common pediatric conditions | Complex pediatric cases |
| Ob/Gyn         | Reproductive physiology  | Normal pregnancy & common conditions | Complicated cases |
| Psychiatry     | Mental health basics     | Common mental disorders | Complex psychiatric scenarios |
| Population Health | Epidemiological principles | Preventive medicine | Health systems & policy |
| Professional Practice | Core ethics      | Clinical governance    | Leadership & complex ethics |

## 5. Technical Implementation with Mistral AI

### Effective Prompt Structure

For best results with Mistral AI, structure your prompts in this sequence:

1. **Specify Domain and Year Level**:
   ```
   Generate a medical SAQ in [specific domain] appropriate for [year level] students.
   ```

2. **Provide Content Parameters**:
   ```
   Focus on [specific condition/presentation] with emphasis on [specific aspects].
   ```

3. **Define Question Structure**:
   ```
   Create a clinical vignette with [specific elements] followed by [number] questions worth a total of [number] marks.
   ```

4. **Request Marking Schema**:
   ```
   Provide a comprehensive marking schema with expected answers, acceptable alternatives, and unacceptable responses.
   ```

5. **Include Rationale Requirements**:
   ```
   Include a rationale section that explains the educational objectives without explicitly referencing the UKMLA framework.
   ```

### Quality Assurance Instructions

Add these guidelines to ensure consistency and quality:

```
Ensure the question:
1. Uses clear, unambiguous language
2. Contains all necessary information needed to answer
3. Has a marking scheme that rewards clinical reasoning
4. Is of appropriate difficulty for the specified year level
5. Aligns with contemporary clinical practice
```

## 6. Sample Implementation Workflow

For optimal question generation, follow this workflow:

1. **Define Question Parameters**:
   - Select specific domain, topic, and clinical year
   - Determine question type and format
   - Specify mark allocation

2. **Generate Initial Question**:
   - Create clinical vignette with appropriate complexity
   - Formulate specific questions with clear instructions
   - Specify character limits for answers

3. **Develop Comprehensive Marking Schema**:
   - List expected answers with specific mark allocation
   - Include acceptable alternatives
   - Specify unacceptable responses
   - Add educational rationale

4. **Review and Refine**:
   - Check alignment with curriculum standards
   - Ensure clinical accuracy and relevance
   - Verify appropriate difficulty level
   - Confirm clarity of wording

5. **Finalize Question Set**:
   - Compile questions across domains
   - Ensure balanced coverage of curriculum
   - Maintain consistent format and style

## 7. Advanced Techniques for Enhanced Questions

### Progressive Case Scenarios
Generate linked questions that follow a patient through different stages of care:

```
Create a three-part progressive case scenario following a patient from:
1. Initial presentation (focus on diagnosis)
2. Acute management (focus on treatment decisions)
3. Follow-up care (focus on complications and long-term management)
```

### Multi-perspective Questions
Generate questions that explore different healthcare perspectives:

```
Create a clinical scenario addressing the same situation from:
1. The doctor's perspective (clinical decision-making)
2. The patient's perspective (communication and consent)
3. The healthcare system perspective (resource allocation and quality)
```

### Integrated Basic Science Questions
Generate questions that explicitly connect foundational sciences with clinical practice:

```
Create a question that requires students to apply [specific basic science concept] to explain the clinical presentation, diagnostic findings, or management rationale in a patient with [specific condition].
```

By implementing these structured approaches with Mistral AI, you can generate high-quality medical SAQs that comprehensively assess students across the medical curriculum while aligning with UKMLA standards.
