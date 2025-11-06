#!/usr/bin/env tsx
/**
 * Import AWS Prompt Engineering Article
 *
 * Creates a learn article from the AWS "What is Prompt Engineering?" page
 *
 * Usage:
 *   pnpm tsx scripts/content/import-aws-prompt-engineering-article.ts
 */

import { getMongoDb } from '@/lib/db/mongodb';
import { marked } from 'marked';

function estimateReadTime(words: number): number {
  // Average reading speed: 200 words per minute
  return Math.ceil(words / 200);
}

async function main() {
  try {
    const db = await getMongoDb();
    const collection = db.collection('learning_resources');

    const slug = 'aws-what-is-prompt-engineering';

    // Check if article already exists
    const existing = await collection.findOne({
      'seo.slug': slug,
    });

    if (existing) {
      console.log(`📄 Article already exists: "${existing.title}"`);
      console.log(`   Slug: ${slug}`);
      console.log(`   Status: ${existing.status}`);
      console.log(`   URL: https://engify.ai/learn/${slug}\n`);
      process.exit(0);
    }

    // Article content based on AWS page
    const title = 'What is Prompt Engineering? - AWS Guide';
    const description =
      'Learn the fundamentals of prompt engineering from AWS. Discover how to guide generative AI solutions to generate desired outputs, explore techniques like chain-of-thought prompting, and understand best practices for effective AI interactions.';

    const content = `# What is Prompt Engineering?

Prompt engineering is the process where you guide generative artificial intelligence (generative AI) solutions to generate desired outputs. Even though generative AI attempts to mimic humans, it requires detailed instructions to create high-quality and relevant output. In prompt engineering, you choose the most appropriate formats, phrases, words, and symbols that guide the AI to interact with your users more meaningfully. Prompt engineers use creativity plus trial and error to create a collection of input texts, so an application's generative AI works as expected.

## What is a Prompt?

A prompt is a natural language text that requests the generative AI to perform a specific task. Generative AI is an artificial intelligence solution that creates new content like stories, conversations, videos, images, and music. It's powered by very large machine learning (ML) models that use deep neural networks that have been pretrained on vast amounts of data.

The large language models (LLMs) are very flexible and can perform various tasks. For example, they can summarize documents, complete sentences, answer questions, and translate languages. For specific user input, the models work by predicting the best output that they determine from past training.

However, because they're so open-ended, your users can interact with generative AI solutions through countless input data combinations. The AI language models are very powerful and don't require much to start creating content. Even a single word is sufficient for the system to create a detailed response.

That being said, not every type of input generates helpful output. Generative AI systems require context and detailed information to produce accurate and relevant responses. When you systematically design prompts, you get more meaningful and usable creations. In prompt engineering, you continuously refine prompts until you get the desired outcomes from the AI system.

## Why is Prompt Engineering Important?

Prompt engineering jobs have increased significantly since the launch of generative AI. Prompt engineers bridge the gap between your end users and the large language model. They identify scripts and templates that your users can customize and complete to get the best result from the language models. These engineers experiment with different types of inputs to build a prompt library that application developers can reuse in different scenarios.

Prompt engineering makes AI applications more efficient and effective. Application developers typically encapsulate open-ended user input inside a prompt before passing it to the AI model.

For example, consider AI chatbots. A user may enter an incomplete problem statement like, "Where to purchase a shirt." Internally, the application's code uses an engineered prompt that says, "You are a sales assistant for a clothing company. A user, based in Alabama, United States, is asking you where to purchase a shirt. Respond with the three nearest store locations that currently stock a shirt." The chatbot then generates more relevant and accurate information.

### Benefits of Prompt Engineering

#### Greater Developer Control

Prompt engineering gives developers more control over users' interactions with the AI. Effective prompts provide intent and establish context to the large language models. They help the AI refine the output and present it concisely in the required format.

They also prevent your users from misusing the AI or requesting something the AI does not know or cannot handle accurately. For instance, you may want to limit your users from generating inappropriate content in a business AI application.

#### Improved User Experience

Users avoid trial and error and still receive coherent, accurate, and relevant responses from AI tools. Prompt engineering makes it easy for users to obtain relevant results in the first prompt. It helps mitigate bias that may be present from existing human bias in the large language models' training data.

Further, it enhances the user-AI interaction so the AI understands the user's intention even with minimal input. For example, requests to summarize a legal document and a news article get different results adjusted for style and tone. This is true even if both users just tell the application, "Summarize this document."

#### Increased Flexibility

Higher levels of abstraction improve AI models and allow organizations to create more flexible tools at scale. A prompt engineer can create prompts with domain-neutral instructions highlighting logical links and broad patterns. Organizations can rapidly reuse the prompts across the enterprise to expand their AI investments.

For example, to find opportunities for process optimization, the prompt engineer can create different prompts that train the AI model to find inefficiencies using broad signals rather than context-specific data. The prompts can then be used for diverse processes and business units.

## Prompt Engineering Use Cases

Prompt engineering techniques are used in sophisticated AI systems to improve user experience with the learning language model. Here are some examples.

### Subject Matter Expertise

Prompt engineering plays a key role in applications that require the AI to respond with subject matter expertise. A prompt engineer with experience in the field can guide the AI to reference the correct sources and frame the answer appropriately based on the question asked.

For example, in the medical field, a physician could use a prompt-engineered language model to generate differential diagnoses for a complex case. The medical professional only needs to enter the symptoms and patient details. The application uses engineered prompts to guide the AI first to list possible diseases associated with the entered symptoms. Then it narrows down the list based on additional patient information.

### Critical Thinking

Critical thinking applications require the language model to solve complex problems. To do so, the model analyzes information from different angles, evaluates its credibility, and makes reasoned decisions. Prompt engineering enhances a model's data analysis capabilities.

For instance, in decision-making scenarios, you could prompt a model to list all possible options, evaluate each option, and recommend the best solution.

### Creativity

Creativity involves generating new ideas, concepts, or solutions. Prompt engineering can be used to enhance a model's creative abilities in various scenarios.

For instance, in writing scenarios, a writer could use a prompt-engineered model to help generate ideas for a story. The writer may prompt the model to list possible characters, settings, and plot points then develop a story with those elements. Or a graphic designer could prompt the model to generate a list of color palettes that evoke a certain emotion then create a design using that palette.

## Prompt Engineering Techniques

Prompt engineering is a dynamic and evolving field. It requires both linguistic skills and creative expression to fine-tune prompts and obtain the desired response from the generative AI tools.

Here are some examples of techniques that prompt engineers use to improve their AI models' natural language processing (NLP) tasks.

### Chain-of-Thought Prompting

Chain-of-thought prompting is a technique that breaks down a complex question into smaller, logical parts that mimic a train of thought. This helps the model solve problems in a series of intermediate steps rather than directly answering the question. This enhances its reasoning ability.

You can perform several chain-of-thought rollouts for complex tasks and choose the most commonly reached conclusion. If the rollouts disagree significantly, a person can be consulted to correct the chain of thought.

For example, if the question is "What is the capital of France?" the model might perform several rollouts leading to answers like "Paris," "The capital of France is Paris," and "Paris is the capital of France." Since all rollouts lead to the same conclusion, "Paris" would be selected as the final answer.

### Tree-of-Thought Prompting

The tree-of-thought technique generalizes chain-of-thought prompting. It prompts the model to generate one or more possible next steps. Then it runs the model on each possible next step using a tree search method.

For example, if the question is "What are the effects of climate change?" the model might first generate possible next steps like "List the environmental effects" and "List the social effects." It would then elaborate on each of these in subsequent steps.

### Maieutic Prompting

Maieutic prompting is similar to tree-of-thought prompting. The model is prompted to answer a question with an explanation. The model is then prompted to explain parts of the explanation. Inconsistent explanation trees are pruned or discarded. This improves performance on complex commonsense reasoning.

For example, if the question is "Why is the sky blue?" the model might first answer, "The sky appears blue to the human eye because the short waves of blue light are scattered in all directions by the gases and particles in the Earth's atmosphere." It might then expand on parts of this explanation, such as why blue light is scattered more than other colors and what the Earth's atmosphere is composed of.

### Complexity-Based Prompting

This prompt-engineering technique involves performing several chain-of-thought rollouts. It chooses the rollouts with the longest chains of thought then chooses the most commonly reached conclusion.

For example, if the question is a complex math problem, the model might perform several rollouts, each involving multiple steps of calculations. It would consider the rollouts with the longest chain of thought, which for this example would be the most steps of calculations. The rollouts that reach a common conclusion with other rollouts would be selected as the final answer.

### Generated Knowledge Prompting

This technique involves prompting the model to first generate relevant facts needed to complete the prompt. Then it proceeds to complete the prompt. This often results in higher completion quality as the model is conditioned on relevant facts.

For example, imagine a user prompts the model to write an essay on the effects of deforestation. The model might first generate facts like "deforestation contributes to climate change" and "deforestation leads to loss of biodiversity." Then it would elaborate on the points in the essay.

### Least-to-Most Prompting

In this prompt engineering technique, the model is prompted first to list the subproblems of a problem, and then solve them in sequence. This approach ensures that later subproblems can be solved with the help of answers to previous subproblems.

For example, imagine that a user prompts the model with a math problem like "Solve for x in equation 2x + 3 = 11." The model might first list the subproblems as "Subtract 3 from both sides" and "Divide by 2". It would then solve them in sequence to get the final answer.

### Self-Refine Prompting

In this technique, the model is prompted to solve the problem, critique its solution, and then resolve the problem considering the problem, solution, and critique. The problem-solving process repeats until it reaches a predetermined reason to stop. For example, it could run out of tokens or time, or the model could output a stop token.

For example, imagine a user prompts a model, "Write a short essay on literature." The model might draft an essay, critique it for lack of specific examples, and rewrite the essay to include specific examples. This process would repeat until the essay is deemed satisfactory or a stop criterion is met.

### Directional-Stimulus Prompting

This prompt engineering technique includes a hint or cue, such as desired keywords, to guide the language model toward the desired output.

For example, if the prompt is to write a poem about love, the prompt engineer may craft prompts that include "heart," "passion," and "eternal." The model might be prompted, "Write a poem about love that includes the words 'heart,' 'passion,' and 'eternal.'" This would guide the model to craft a poem with these keywords.

## Prompt Engineering Best Practices

Good prompt engineering requires you to communicate instructions with context, scope, and expected response. Here are some best practices.

### Unambiguous Prompts

Clearly define the desired response in your prompt to avoid misinterpretation by the AI. For instance, if you are asking for a novel summary, clearly state that you are looking for a summary, not a detailed analysis. This helps the AI to focus only on your request and provide a response that aligns with your objective.

### Adequate Context Within the Prompt

Provide adequate context within the prompt and include output requirements in your prompt input, confining it to a specific format. For instance, say you want a list of the most popular movies of the 1990s in a table. To get the exact result, you should explicitly state how many movies you want to be listed and ask for table formatting.

### Balance Between Targeted Information and Desired Output

Balance simplicity and complexity in your prompt to avoid vague, unrelated, or unexpected answers. A prompt that is too simple may lack context, while a prompt that is too complex may confuse the AI. This is especially important for complex topics or domain-specific language, which may be less familiar to the AI. Instead, use simple language and reduce the prompt size to make your question more understandable.

### Experiment and Refine the Prompt

Prompt engineering is an iterative process. It's essential to experiment with different ideas and test the AI prompts to see the results. You may need multiple tries to optimize for accuracy and relevance. Continuous testing and iteration reduce the prompt size and help the model generate better output. There are no fixed rules for how the AI outputs information, so flexibility and adaptability are essential.

## AWS Services for Generative AI

Amazon Web Services (AWS) offers the breadth and depth of tools to build and use generative AI. For example, you can use these services:

- **Amazon CodeWhisperer** to generate code suggestions ranging from snippets to full functions in real time based on your comments and existing code.
- **Amazon Bedrock** to accelerate development of generative AI applications using language models through an API, without managing infrastructure.
- **Amazon SageMaker JumpStart** to discover, explore, and deploy open source language models. For example, you can work with models like OpenLLaMA, RedPajama, MosaicML's MPT-7B, FLAN-T5, GPT-NeoX-20B, and BLOOM.

If you prefer to create your own models, use Amazon SageMaker. It provides managed infrastructure and tools to accelerate scalable, reliable, and secure model building, training, and deployment.

## Conclusion

Prompt engineering is a critical skill for anyone working with generative AI. By understanding the fundamentals, exploring various techniques, and following best practices, you can significantly improve the quality and relevance of AI-generated outputs. Whether you're building AI applications, optimizing existing models, or simply trying to get better results from AI tools, prompt engineering will help you achieve your goals more effectively.

---

*This article is adapted from the [AWS documentation on prompt engineering](https://aws.amazon.com/what-is/prompt-engineering/). For more information on AWS generative AI services, visit the AWS website.*`;

    const contentHtml = marked(content);
    const wordCount = content.split(/\s+/).length;
    const readTime = estimateReadTime(wordCount);

    const article = {
      id: `ext-aws-what-is-pe`,
      title,
      description,
      content: content, // Markdown
      contentHtml: contentHtml, // HTML
      category: 'prompt-engineering',
      type: 'article',
      level: 'beginner',
      duration: `${readTime} min read`,
      tags: [
        'prompt-engineering',
        'aws',
        'generative-ai',
        'llm',
        'ai-fundamentals',
        'chain-of-thought',
        'ai-techniques',
        'best-practices',
      ],
      featured: false,
      status: 'active',
      author: 'AWS',
      source: 'https://aws.amazon.com/what-is/prompt-engineering/',
      seo: {
        metaTitle: `${title} | Engify.ai`,
        metaDescription: description,
        keywords: [
          'prompt engineering',
          'aws prompt engineering',
          'generative AI',
          'large language models',
          'LLM',
          'chain-of-thought prompting',
          'AI prompts',
          'prompt engineering techniques',
          'AI best practices',
          'Amazon Bedrock',
          'Amazon CodeWhisperer',
        ],
        slug,
        canonicalUrl: `https://engify.ai/learn/${slug}`,
        ogImage: `https://engify.ai/og/${slug}.png`,
      },
      views: 0,
      shares: 0,
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      organizationId: null, // Public content
    };

    await collection.insertOne(article);

    console.log('✅ Article created successfully!\n');
    console.log(`📄 Title: ${title}`);
    console.log(`🔗 Slug: ${slug}`);
    console.log(`🌐 URL: https://engify.ai/learn/${slug}`);
    console.log(`📊 Word count: ${wordCount} words`);
    console.log(`⏱️  Read time: ${readTime} minutes`);
    console.log(`📚 Tags: ${article.tags.join(', ')}`);
    console.log(`\n✨ Article is now live at /learn/${slug}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
