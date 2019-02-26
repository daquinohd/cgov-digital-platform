<?php

namespace Drupal\cgov_core\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Entity\Query\QueryFactory;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a block that displays pager variants.
 *
 * @Block(
 *  id = "cgov_pager",
 *  admin_label = "CGov Pager",
 *  category = @Translation("Cgov Digital Platform"),
 * )
 */
class CgovPager extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * The language manager.
   *
   * @var \Drupal\Core\Language\LanguageManagerInterface
   */
  protected $languageManager;

  /**
   * The route matcher.
   *
   * @var \Drupal\Core\Routing\RouteMatchInterface
   */
  protected $routeMatcher;

  /**
   * An entity query.
   *
   * @var Drupal\Core\Entity\Query\QueryFactory
   */
  protected $entityQuery;

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * Constructs a CgovPager object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Language\LanguageManagerInterface $language_manager
   *   The language manager.
   * @param \Drupal\Core\Routing\RouteMatchInterface $route_matcher
   *   The route matcher.
   * @param \Drupal\Core\Entity\Query\QueryFactory $entity_query
   *   An entity query.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager service.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    LanguageManagerInterface $language_manager,
    RouteMatchInterface $route_matcher,
    QueryFactory $entity_query,
    EntityTypeManagerInterface $entity_type_manager
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->languageManager = $language_manager;
    $this->routeMatcher = $route_matcher;
    $this->entityQuery = $entity_query;
    $this->entityTypeManager = $entity_type_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('language_manager'),
      $container->get('current_route_match'),
      $container->get('entity.query'),
      $container->get('entity_type.manager')
    );
  }

  /**
   * Gets the current entity if there is one.
   *
   * @return Drupal\Core\Entity\ContentEntityInterface
   *   The retrieved entity, or FALSE if none found.
   */
  private function getCurrEntity() {
    $params = $this->routeMatcher->getParameters()->all();
    foreach ($params as $param) {
      if ($param instanceof ContentEntityInterface) {
        // If you find a ContentEntityInterface stop iterating and return it.
        return $param;
      }
    }
    return FALSE;
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    // Initialize the render array response to be empty.
    $build = [];

    // Debug entity object.
    if ($curr_entity = $this->getCurrEntity()) {
      $content_type = $curr_entity->bundle();
      $content_id = $curr_entity->id();

      // Build our query.
      $query = $this->entityQuery->get('node');
      $query->condition('status', 1);
      $query->condition('type', $content_type);
      $query->sort('field_date_posted');
      $entity_ids = $query->execute();

      // Using entity ID, build array of values sorted by date.
      $node_storage = $this->entityTypeManager->getStorage('node');
      $ass_array = [];
    }

    // Build custom pager based on type.
    switch ($content_type) {
      case 'cgov_blog_post':

        // Build associative array.
        foreach ($entity_ids as $nid) {
          $node = $node_storage->load($nid);
          // $posted[$nid] = $node->field_date_posted->value;.
          $ass_array[] = [
            'nid' => $nid,
            'date' => $node->field_date_posted->value,
          ];
        }

        // Debug the whole thing.
        ksm($content_id);
        ksm($ass_array);
        $prev_link = '';
        $next_link = '';

        // Draw our prev/next links.
        foreach ($ass_array as $index => $ass) {
          if ($ass['nid'] == $content_id) {
            $build['#markup'] = '';
            $length = count($ass_array);

            if ($index > 0) {
              $prev_link = $ass_array[$index - 1];
              $build['#markup'] .= "
                <a href=/prev>" . $prev_link['date'] . "</a>
              ";
            }

            if ($index < ($length - 1)) {
              $next_link = $ass_array[$index + 1];
              $build['#markup'] .= "
                <a href=/next>" . $next_link['date'] . "</a>
              ";
            }
            break;
          }
        }
        break;

      default:
        $build['#markup'] = '<b>not a blog post</b>';
    }

    // Debug build object.
    // Xksm($build);!
    return $build;
  }

  /**
   * {@inheritdoc}
   *
   * @todo Make cacheable in https://www.drupal.org/node/2232375.
   */
  public function getCacheMaxAge() {
    return 0;
  }

}
