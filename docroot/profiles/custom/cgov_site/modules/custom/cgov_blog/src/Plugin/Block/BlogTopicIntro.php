<?php

namespace Drupal\cgov_blog\Plugin\Block;

use Drupal\cgov_blog\Services\BlogManagerInterface;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a Featured Posts Block.
 *
 * @Block(
 *   id = "cgov_blog_topic_intro",
 *   admin_label = @Translation("Cgov Blog Category About"),
 *   category = @Translation("Cgov Digital Platform"),
 * )
 */
class BlogTopicIntro extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * The BlogManager object.
   *
   * @var \Drupal\cgov_blog\Services\BlogManagerInterface
   */
  public $blogManager;

  /**
   * Constructs a blog entity object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\cgov_blog\Services\BlogManagerInterface $blog_manager
   *   A blog manager object.
   */
  public function __construct(
    // Constructor with args.
    array $configuration,
    $plugin_id,
    $plugin_definition,
    BlogManagerInterface $blog_manager
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->blogManager = $blog_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    // Create an instance of this plugin with the blog_manager service.
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('cgov_blog.blog_manager')
    );
  }

  /**
   * Create HTML.
   *
   * {@inheritdoc}
   */
  public function build() {
    // Empty build object.
    $build = [];

    // Return collection of intros.
    $topic_intro = $this->getTopicIntro();
    $build = [
      'topic_intro' => $topic_intro,
    ];
    return $build;
  }

  /**
   * Get category descriptions.
   *
   * {@inheritdoc}
   */
  private function getTopicIntro() {
    // Get collection of associated topics and the filter from the URL.
    $description = '';
    $topics = $this->blogManager->getSeriesTopics();
    $filter = 'biology';
    /*
     * $filter = \Drupal::request()->query->get('topic');
     */
    // Get Blog Topic taxonomy terms in English and Spanish.
    foreach ($topics as $topic) {
      $tid = $topic->tid;
      $urlEn = $this->blogManager->loadBlogTopic($tid, 'en')->field_topic_pretty_url->value ?? $tid;
      $urlEs = $this->blogManager->loadBlogTopic($tid, 'es')->field_topic_pretty_url->value ?? $tid;

      // If a pretty URL / filter match is found, return the description field.
      if ($urlEn == $filter || $urlEs == $filter) {
        $description = $this->blogManager->loadBlogTopic($tid)->description->value;
        break;
      }
    }
    return $description;
  }

}
