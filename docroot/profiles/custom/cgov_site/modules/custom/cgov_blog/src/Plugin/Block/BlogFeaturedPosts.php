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
 *   id = "cgov_blog_featured_posts",
 *   admin_label = @Translation("Cgov Blog Featured Posts"),
 *   category = @Translation("Cgov Digital Platform"),
 * )
 */
class BlogFeaturedPosts extends BlockBase implements ContainerFactoryPluginInterface {

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
   * {@inheritdoc}
   */
  public function build() {
    $my_featured = $this->blogManager->getSeriesFeaturedContent();

    $i = 0;
    foreach ($my_featured as $feat) {
      $feat = $i;
      kint('debug: ' . $feat);
      $i = $i + 1;
    }

    $featured[0] = [
      'title' => 'New Lung Cancer Target',
      'href' => 'xpol-kras-lung-target/',
      'date' => $this->t('February 2, 2017'),
      'author' => 'Amy E. Blum, M.A.',
    ];
    $featured[1] = [
      'title' => 'A tour of GDC DAVE',
      'href' => 'gdc-dave-tour/',
      'date' => $this->t('September 12, 2017'),
      'author' => 'Zhining Wang, Ph.D.',
    ];
    $featured[2] = [
      'title' => 'TCGA&apos;s PanCanAtlas',
      'href' => 'tcga-pancan-atlas/',
      'date' => $this->t('January 9, 2017'),
      'author' => 'Amy E. Blum, M.A.',
    ];

    $build = [
      '#featured' => $featured,
    ];
    return $build;
  }

}
